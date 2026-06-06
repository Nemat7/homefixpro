import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MousePos {
  x: number;
  y: number;
  active: boolean;
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webgpuSupported, setWebgpuSupported] = useState(true);
  const mouseRef = useRef<MousePos>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check WebGPU support
    if (!navigator.gpu) {
      setWebgpuSupported(false);
      return;
    }

    let device: GPUDevice | null = null;
    let context: GPUCanvasContext | null = null;
    let animationId = 0;
    let disposed = false;

    const PARTICLE_COUNT = window.innerWidth < 768 ? 16384 : 65536;
    const WORKGROUP_SIZE = 64;

    async function init() {
      try {
        const adapter = await navigator.gpu!.requestAdapter();
        if (!adapter) {
          setWebgpuSupported(false);
          return;
        }
        device = await adapter.requestDevice();
        if (disposed) return;

        context = canvas!.getContext('webgpu') as GPUCanvasContext;
        if (!context) {
          setWebgpuSupported(false);
          return;
        }

        const presentationFormat = navigator.gpu!.getPreferredCanvasFormat();
        context.configure({
          device,
          format: presentationFormat,
          alphaMode: 'opaque',
        });

        // Resize canvas to match display size
        const resize = () => {
          const dpr = Math.min(window.devicePixelRatio, 2);
          const w = canvas!.clientWidth;
          const h = canvas!.clientHeight;
          canvas!.width = w * dpr;
          canvas!.height = h * dpr;
        };
        resize();
        window.addEventListener('resize', resize);

        // Global uniform buffer
        const globalUniformBuffer = device.createBuffer({
          size: 32,
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        // Particle buffers (ping-pong)
        const particleBuffers = [0, 1].map(() =>
          device!.createBuffer({
            size: PARTICLE_COUNT * 40,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE,
          })
        );

        // Initialize particles
        const initData = new Float32Array(PARTICLE_COUNT * 10); // 10 floats per particle (40 bytes / 4)
        for (let i = 0; i < PARTICLE_COUNT; i++) {
          const offset = i * 10;
          initData[offset + 0] = Math.random() * 2 - 1; // pos.x
          initData[offset + 1] = Math.random() * 2 - 1; // pos.y
          initData[offset + 2] = Math.random() * 0.5 - 0.25; // pos.z
          initData[offset + 3] = 0; // pad
          initData[offset + 4] = (Math.random() - 0.5) * 0.002; // vel.x
          initData[offset + 5] = (Math.random() - 0.5) * 0.002; // vel.y
          initData[offset + 6] = 0.5 + Math.random() * 2; // life
          initData[offset + 7] = 1.5 + Math.random() * 3; // size
          initData[offset + 8] = initData[offset + 0]; // prevPos1.x
          initData[offset + 9] = initData[offset + 1]; // prevPos1.y
        }
        device.queue.writeBuffer(particleBuffers[0], 0, initData);
        device.queue.writeBuffer(particleBuffers[1], 0, initData);

        // Compute shader
        const computeShader = device.createShaderModule({
          code: `
            struct GlobalUniforms {
              time: f32,
              deltaTime: f32,
              resolution: vec2<f32>,
              mousePos: vec2<f32>,
              mouseActive: f32,
              particleCount: f32,
            }
            @binding(0) @group(0) var<uniform> globals: GlobalUniforms;
            @binding(1) @group(0) var<storage, read> particlesIn: array<f32>;
            @binding(2) @group(0) var<storage, read_write> particlesOut: array<f32>;

            fn hash(p: vec2<f32>) -> f32 {
              return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }

            fn noise(p: vec2<f32>) -> f32 {
              let i = floor(p);
              let f = fract(p);
              let a = hash(i);
              let b = hash(i + vec2(1.0, 0.0));
              let c = hash(i + vec2(0.0, 1.0));
              let d = hash(i + vec2(1.0, 1.0));
              let u = f * f * (3.0 - 2.0 * f);
              return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
            }

            @compute @workgroup_size(64)
            fn main(@builtin(global_invocation_id) id: vec3<u32>) {
              let idx = id.x;
              if (f32(idx) >= globals.particleCount) { return; }

              let i = idx * 10u;
              var pos = vec2<f32>(particlesIn[i + 0u], particlesIn[i + 1u]);
              var life = particlesIn[i + 6u];
              var size = particlesIn[i + 7u];
              let prevPos = vec2<f32>(particlesIn[i + 8u], particlesIn[i + 9u]);

              life = life - globals.deltaTime;

              if (life <= 0.0) {
                pos = vec2<f32>(
                  (hash(vec2<f32>(f32(idx), globals.time)) - 0.5) * 2.2,
                  (hash(vec2<f32>(f32(idx) + 100.0, globals.time)) - 0.5) * 2.2
                );
                life = 1.0 + hash(vec2<f32>(f32(idx), globals.time + 50.0)) * 2.0;
                size = 1.5 + hash(vec2<f32>(f32(idx), globals.time + 100.0)) * 3.0;
              }

              // Flow field
              let n1 = noise(pos * 2.0 + globals.time * 0.15);
              let n2 = noise(pos * 3.0 - globals.time * 0.1 + vec2(50.0, 50.0));
              var vel = vec2<f32>(
                (n1 - 0.5) * 0.003,
                (n2 - 0.5) * 0.003 - 0.001
              );

              // Mouse interaction
              if (globals.mouseActive > 0.5) {
                let mouseNorm = globals.mousePos * 2.0 - 1.0;
                let toMouse = pos - mouseNorm;
                let dist = length(toMouse);
                if (dist < 0.3) {
                  let force = (0.3 - dist) / 0.3;
                  vel += normalize(toMouse) * force * 0.008;
                }
              }

              pos = pos + vel;

              // Wrap around
              if (pos.x > 1.2) { pos.x = -1.2; }
              if (pos.x < -1.2) { pos.x = 1.2; }
              if (pos.y > 1.2) { pos.y = -1.2; }
              if (pos.y < -1.2) { pos.y = 1.2; }

              // Write output
              particlesOut[i + 0u] = pos.x;
              particlesOut[i + 1u] = pos.y;
              particlesOut[i + 2u] = particlesIn[i + 2u];
              particlesOut[i + 3u] = 0.0;
              particlesOut[i + 4u] = vel.x;
              particlesOut[i + 5u] = vel.y;
              particlesOut[i + 6u] = life;
              particlesOut[i + 7u] = size;
              particlesOut[i + 8u] = pos.x;
              particlesOut[i + 9u] = pos.y;
            }
          `,
        });

        const computePipeline = device.createComputePipeline({
          layout: 'auto',
          compute: { module: computeShader, entryPoint: 'main' },
        });

        // Render shaders
        const vertexShader = device.createShaderModule({
          code: `
            struct VertexOutput {
              @builtin(position) position: vec4<f32>,
              @location(0) color: vec4<f32>,
              @location(1) size: f32,
            }

            @vertex
            fn main(@location(0) pos: vec3<f32>,
                    @location(1) color: vec4<f32>,
                    @location(2) size: f32) -> VertexOutput {
              var out: VertexOutput;
              out.position = vec4<f32>(pos.xy, 0.0, 1.0);
              out.color = color;
              out.size = size;
              return out;
            }
          `,
        });

        const fragmentShader = device.createShaderModule({
          code: `
            struct FragInput {
              @location(0) color: vec4<f32>,
              @location(1) size: f32,
            }

            @fragment
            fn main(in: FragInput) -> @location(0) vec4<f32> {
              let dist = length(in.position.xy * 2.0 - vec2<f32>(1.0));
              let alpha = smoothstep(1.0, 0.0, dist);
              let lifeFade = in.color.a;
              let orange = vec3<f32>(1.0, 0.42, 0.21);
              let red = vec3<f32>(0.9, 0.22, 0.27);
              let colorMix = mix(red, orange, lifeFade);
              return vec4<f32>(colorMix, alpha * lifeFade * 0.8);
            }
          `,
        });

        const renderPipeline = device.createRenderPipeline({
          layout: 'auto',
          vertex: {
            module: vertexShader,
            entryPoint: 'main',
            buffers: [
              {
                arrayStride: 40,
                attributes: [
                  { shaderLocation: 0, offset: 0, format: 'float32x3' },
                  { shaderLocation: 1, offset: 16, format: 'float32x4' },
                  { shaderLocation: 2, offset: 28, format: 'float32' },
                ],
              },
            ],
          },
          fragment: {
            module: fragmentShader,
            entryPoint: 'main',
            targets: [
              {
                format: presentationFormat,
                blend: {
                  color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' },
                  alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' },
                },
              },
            ],
          },
          primitive: { topology: 'point-list' },
        });

        let currentBuffer = 0;
        let frame = 0;
        const startTime = performance.now();

        function render() {
          if (disposed || !device || !context) return;
          frame++;
          const time = (performance.now() - startTime) / 1000;
          const deltaTime = 0.016;

          // Update uniforms
          const uniformData = new Float32Array([
            time, deltaTime,
            canvas!.width, canvas!.height,
            mouseRef.current.x, mouseRef.current.y,
            mouseRef.current.active ? 1.0 : 0.0,
            PARTICLE_COUNT,
          ]);
          device!.queue.writeBuffer(globalUniformBuffer, 0, uniformData);

          // Compute pass
          const computeBindGroup = device!.createBindGroup({
            layout: computePipeline.getBindGroupLayout(0),
            entries: [
              { binding: 0, resource: { buffer: globalUniformBuffer } },
              { binding: 1, resource: { buffer: particleBuffers[currentBuffer] } },
              { binding: 2, resource: { buffer: particleBuffers[1 - currentBuffer] } },
            ],
          });

          const commandEncoder = device!.createCommandEncoder();

          const computePass = commandEncoder.beginComputePass();
          computePass.setPipeline(computePipeline);
          computePass.setBindGroup(0, computeBindGroup);
          computePass.dispatchWorkgroups(Math.ceil(PARTICLE_COUNT / WORKGROUP_SIZE));
          computePass.end();

          // Render pass
          const textureView = context!.getCurrentTexture().createView();
          const renderPassDescriptor: GPURenderPassDescriptor = {
            colorAttachments: [
              {
                view: textureView,
                clearValue: { r: 0.04, g: 0.025, b: 0.015, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
              },
            ],
          };

          const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
          renderPass.setPipeline(renderPipeline);
          renderPass.setVertexBuffer(0, particleBuffers[1 - currentBuffer]);
          renderPass.draw(PARTICLE_COUNT);
          renderPass.end();

          device!.queue.submit([commandEncoder.finish()]);

          currentBuffer = 1 - currentBuffer;
          animationId = requestAnimationFrame(render);
        }

        animationId = requestAnimationFrame(render);

        return () => {
          window.removeEventListener('resize', resize);
        };
      } catch (err) {
        console.warn('WebGPU init failed:', err);
        setWebgpuSupported(false);
      }
    }

    init();

    return () => {
      disposed = true;
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  // Mouse tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - rect.left) / rect.width;
      mouseRef.current.y = 1.0 - (e.clientY - rect.top) / rect.height;
      mouseRef.current.active = true;
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  const handleScrollDown = () => {
    const el = document.querySelector('#services');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative w-full min-h-[100dvh] overflow-hidden">
      {/* Canvas or Fallback */}
      {webgpuSupported ? (
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        />
      ) : (
        <div className="hero-fallback absolute inset-0 z-0" />
      )}

      {/* Content Overlay */}
      <div
        className="relative z-10 flex flex-col justify-center min-h-[100dvh] px-6 sm:px-12 lg:px-20"
        style={{ pointerEvents: 'none' }}
      >
        <div className="max-w-[600px]" style={{ pointerEvents: 'auto' }}>
          <p className="section-label mb-4 text-shadow-sub">
            REPAIR · REMODEL · RENOVATE
          </p>
          <h1 className="font-display font-bold text-white uppercase leading-[0.95] tracking-[-0.02em] text-shadow-hero"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
            We Forge Your<br />Dream Home
          </h1>
          <p className="mt-6 text-white/90 font-body text-lg leading-relaxed max-w-[480px] text-shadow-sub">
            From minor repairs to complete renovations, HomeFixPros LLC delivers craftsmanship
            you can trust across New Jersey.
          </p>
          <div className="flex flex-wrap gap-4 mt-8">
            <button
              onClick={() => {
                const el = document.querySelector('#contact');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary"
            >
              Get Free Estimate
            </button>
            <button
              onClick={() => {
                const el = document.querySelector('#projects');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-8 py-3.5 bg-transparent border-2 border-white text-white font-body font-semibold text-sm uppercase tracking-wider rounded-lg transition-all duration-300 hover:bg-white hover:text-charcoal"
            >
              View Our Work
            </button>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={handleScrollDown}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/80 hover:text-white transition-colors animate-bounce-gentle"
        aria-label="Scroll down"
      >
        <ChevronDown size={32} />
      </button>
    </section>
  );
}
