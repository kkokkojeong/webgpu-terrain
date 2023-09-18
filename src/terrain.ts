import basicShader from "./shaders/basic";

class Terrain {

    private _canvas: HTMLCanvasElement;

    private _adapter: GPUAdapter | null = null;
    private _device: GPUDevice | null = null;
    private _context: GPUCanvasContext | null = null;
    private _pipeline: GPURenderPipeline | null = null; 

    private _initialized: boolean = false;

    constructor(id: string) {
        this._canvas = document.getElementById(id) as HTMLCanvasElement;

        this._init();
    }

    public async render() {
        if (!this._initialized) await this._init();

        const device = this._device as GPUDevice;
        const context = this._context as GPUCanvasContext;
        const pipeline = this._pipeline as GPURenderPipeline;

        const textureView = context.getCurrentTexture().createView();
        const commandEncoder = device.createCommandEncoder({
            label: 'terrain render command'
        });
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.8, g: 0.8, b: 0.8, a: 1.0 }, // background color
                loadOp: 'clear',
                storeOp: 'store'
            }]
        });

        renderPass.setPipeline(pipeline);
        renderPass.draw(3);  // call our vertex shader 3 times
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

        context.configure({
            device,
            format: canvasFormat,
            // alphaMode: "opaque"
        });

        const pipleline = device.createRenderPipeline({
            label: "terrain render pipeline",
            layout: "auto",
            vertex: {
                module: device.createShaderModule({
                    label: 'terrain vertex shader',
                    code: basicShader.vertexShader,
                }),
                entryPoint: "main"
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
            }
        });

        this._adapter = adapter;
        this._device = device;
        this._context = context;
        this._pipeline = pipleline;
    }
}

export default Terrain;