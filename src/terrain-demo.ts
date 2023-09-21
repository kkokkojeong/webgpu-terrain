import BasicTerrain from "./BasicTerrain";
import basicShader from "./shaders/basic";

type PolygonMode = 'line' | 'fill'; 

class TerrainDemo {

    private _canvas: HTMLCanvasElement;

    private _adapter: GPUAdapter | null = null;
    private _device: GPUDevice | null = null;
    private _context: GPUCanvasContext | null = null;
    private _pipeline: GPURenderPipeline | null = null; 

    private _initialized: boolean = false;

    private _vertexBuffer: GPUBuffer;
    private _indexBuffer: GPUBuffer;

    // terrain
    private _terrain: BasicTerrain;

    private _polygonMode: PolygonMode = 'line';

    constructor(id: string, terrainData: {
        width: number,
        depth: number,
        heigts: number[];
    }) {
        const {width, depth, heigts} = terrainData;

        this._canvas = document.getElementById(id) as HTMLCanvasElement;
        this._canvas.width = this._canvas.width * devicePixelRatio;
        this._canvas.height = this._canvas.height * devicePixelRatio; 

        this._terrain = new BasicTerrain(width, depth, heigts);
    }

    public async render() {
        if (!this._initialized) await this._init();

        const device = this._device as GPUDevice;
        const context = this._context as GPUCanvasContext;
        const pipeline = this._pipeline as GPURenderPipeline;

        const indexCount = this._terrain.getMesh().indices.length;
        const vertexCount = this._terrain.getMesh().vertices.length / 3;

        const textureView = context.getCurrentTexture().createView();
        const depthTexture = device.createTexture({
            size: [this._canvas.width, this._canvas.height, 1],
            format: "depth24plus",
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        const commandEncoder = device.createCommandEncoder({
            label: 'terrain render command'
        });
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.8, g: 0.8, b: 0.8, a: 1.0 }, // background color
                loadOp: 'clear',
                storeOp: 'store'
            }],
             // for 3d, set depth buffer
             depthStencilAttachment: {
                view: depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: "store",
                /*stencilClearValue: 0,
                stencilLoadValue: 0,
                stencilLoadOp: 'clear',
                stencilStoreOp: "store"*/
            }
        });

        renderPass.setPipeline(pipeline);

        renderPass.setVertexBuffer(0, this._vertexBuffer);
        renderPass.setIndexBuffer(this._indexBuffer, "uint32")


        renderPass.drawIndexed(indexCount);


        console.log(vertexCount, indexCount);

        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
    }

    private async _init() {
        if (this._initialized) return;

        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error("WebGPURenderer: Unable to create WebGPU adapter.");
        }

        const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
        const device = await adapter.requestDevice();
        const context = this._canvas.getContext("webgpu") as GPUCanvasContext;
        console.log("canvasFormat", canvasFormat);

        context.configure({
            device,
            format: canvasFormat,
            alphaMode: "opaque"
        });

        const pipleline = device.createRenderPipeline({
            label: "terrain render pipeline",
            layout: "auto",
            vertex: {
                module: device.createShaderModule({
                    label: 'terrain vertex shader',
                    code: basicShader.vertexShader,
                }),
                entryPoint: "main",
                // if use GPU buffers, the buffers property is a must
                buffers: [
                    {
                        arrayStride: 12,
                        attributes: [{
                            shaderLocation: 0,
                            format: "float32x3",
                            offset: 0
                        }]
                    }
                ]
            },
            fragment: {
                module: device.createShaderModule({
                    label: 'terrain fragment shader',
                    code: basicShader.fragmentShader,
                }),
                entryPoint: "main",
                targets: [{
                    format: canvasFormat
                }]
            },
            primitive: {
                topology: this._polygonMode === 'fill' ? "triangle-list" : "line-list",
                cullMode: "back"
            },
            depthStencil: {
                format: "depth24plus",
                depthWriteEnabled: true,
                depthCompare: "less"
            }
        });

        this._adapter = adapter;
        this._device = device;
        this._context = context;
        this._pipeline = pipleline;

        // create buffer(vertices, index)
        const terrain = this._terrain;
        const { vertices, indices } = terrain.getMesh();

        const vertexBuffer = device.createBuffer({
            label: "terrain vertices buffer",
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true
        });
        const indexBuffer = device.createBuffer({
            label: "terrain indices buffer",
            size: indices.byteLength,
            usage: GPUBufferUsage.INDEX,
            mappedAtCreation: true
        });

        // buffer 생성 후 반드시 unmap 필요
        new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
        vertexBuffer.unmap();

        new Uint32Array(indexBuffer.getMappedRange()).set(indices);
        indexBuffer.unmap();

        // new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
        // new Uint32Array(indexBuffer.getMappedRange()).set(indices);

        // vertexBuffer.unmap();
        // indexBuffer.unmap();

        this._vertexBuffer = vertexBuffer;
        this._indexBuffer = indexBuffer;

        console.log(this._vertexBuffer, this._indexBuffer);

        this._initialized = true;
    }
}

export default TerrainDemo;