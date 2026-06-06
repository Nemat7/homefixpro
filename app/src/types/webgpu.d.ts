interface Navigator {
  gpu?: GPU;
}

interface GPU {
  requestAdapter(): Promise<GPUAdapter | null>;
  getPreferredCanvasFormat(): GPUTextureFormat;
}

interface GPUAdapter {
  requestDevice(): Promise<GPUDevice>;
}

type GPUTextureFormat = string;

type GPUBufferUsageFlags = number;
interface GPUBufferUsage {
  VERTEX: GPUBufferUsageFlags;
  STORAGE: GPUBufferUsageFlags;
  UNIFORM: GPUBufferUsageFlags;
  COPY_DST: GPUBufferUsageFlags;
}

type GPUTextureUsageFlags = number;
interface GPUTextureUsage {
  TEXTURE_BINDING: GPUTextureUsageFlags;
  STORAGE_BINDING: GPUTextureUsageFlags;
}

declare const GPUBufferUsage: GPUBufferUsage;
declare const GPUTextureUsage: GPUTextureUsage;

interface GPUDevice {
  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer;
  createTexture(descriptor: GPUTextureDescriptor): GPUTexture;
  createShaderModule(descriptor: GPUShaderModuleDescriptor): GPUShaderModule;
  createComputePipeline(descriptor: GPUComputePipelineDescriptor): GPUComputePipeline;
  createRenderPipeline(descriptor: GPURenderPipelineDescriptor): GPURenderPipeline;
  createBindGroup(descriptor: GPUBindGroupDescriptor): GPUBindGroup;
  createCommandEncoder(): GPUCommandEncoder;
  queue: GPUQueue;
  lost: Promise<{ reason: string; message: string }>;
}

interface GPUBufferDescriptor {
  size: number;
  usage: GPUBufferUsageFlags;
}

interface GPUBuffer {
  destroy(): void;
}

interface GPUTextureDescriptor {
  size: [number, number];
  format: GPUTextureFormat;
  usage: GPUTextureUsageFlags;
}

interface GPUTexture {
  createView(): GPUTextureView;
  destroy(): void;
}

interface GPUTextureView {}

interface GPUShaderModuleDescriptor {
  code: string;
}

interface GPUShaderModule {}

interface GPUComputePipelineDescriptor {
  layout: 'auto';
  compute: {
    module: GPUShaderModule;
    entryPoint: string;
  };
}

interface GPUComputePipeline {
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUBindGroupLayout {}

interface GPURenderPipelineDescriptor {
  layout: 'auto';
  vertex: {
    module: GPUShaderModule;
    entryPoint: string;
    buffers: GPUVertexBufferLayout[];
  };
  fragment: {
    module: GPUShaderModule;
    entryPoint: string;
    targets: GPUColorTargetState[];
  };
  primitive?: {
    topology: string;
  };
}

interface GPUVertexBufferLayout {
  arrayStride: number;
  attributes: GPUVertexAttribute[];
}

interface GPUVertexAttribute {
  shaderLocation: number;
  offset: number;
  format: string;
}

interface GPUColorTargetState {
  format: GPUTextureFormat;
  blend?: {
    color: {
      srcFactor: string;
      dstFactor: string;
      operation: string;
    };
    alpha: {
      srcFactor: string;
      dstFactor: string;
      operation: string;
    };
  };
}

interface GPURenderPipeline {
  getBindGroupLayout(index: number): GPUBindGroupLayout;
}

interface GPUBindGroupDescriptor {
  layout: GPUBindGroupLayout;
  entries: GPUBindGroupEntry[];
}

interface GPUBindGroupEntry {
  binding: number;
  resource: GPUBindingResource;
}

type GPUBindingResource = { buffer: GPUBuffer } | { texture: GPUTexture } | { view: GPUTextureView } | GPUExternalTexture | GPUSampler;

interface GPUExternalTexture {}
interface GPUSampler {}

interface GPUCommandEncoder {
  beginComputePass(): GPUComputePassEncoder;
  beginRenderPass(descriptor: GPURenderPassDescriptor): GPURenderPassEncoder;
  finish(): GPUCommandBuffer;
}

interface GPUComputePassEncoder {
  setPipeline(pipeline: GPUComputePipeline): void;
  setBindGroup(index: number, bindGroup: GPUBindGroup): void;
  dispatchWorkgroups(x: number): void;
  end(): void;
}

interface GPURenderPassDescriptor {
  colorAttachments: GPURenderPassColorAttachment[];
}

interface GPURenderPassColorAttachment {
  view: GPUTextureView;
  clearValue?: { r: number; g: number; b: number; a: number };
  loadOp: string;
  storeOp: string;
}

interface GPURenderPassEncoder {
  setPipeline(pipeline: GPURenderPipeline): void;
  setVertexBuffer(slot: number, buffer: GPUBuffer): void;
  draw(vertexCount: number): void;
  end(): void;
}

interface GPUCommandBuffer {}

interface GPUQueue {
  writeBuffer(buffer: GPUBuffer, offset: number, data: ArrayBufferView): void;
  submit(commandBuffers: GPUCommandBuffer[]): void;
}

interface HTMLCanvasElement {
  getContext(contextId: 'webgpu'): GPUCanvasContext | null;
}

interface GPUCanvasContext {
  canvas: HTMLCanvasElement;
  configure(configuration: GPUCanvasConfiguration): void;
  getCurrentTexture(): GPUTexture;
}

interface GPUCanvasConfiguration {
  device: GPUDevice;
  format: GPUTextureFormat;
  alphaMode?: string;
}
