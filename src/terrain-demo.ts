import {mat4, vec3, utils} from 'wgpu-matrix';

import BasicTerrain from "./BasicTerrain";
import basicShader from "./shaders/basic";

import ArcballCamera from './camera/ArcballCamera';
import MouseHandler from './ui/MouseHandler';


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
    private _uniformBuffer: GPUBuffer;

    private _bindGroup: GPUBindGroup;

    // terrain
    private _terrain: BasicTerrain;

    // ui, camera
    private _camera: ArcballCamera;
    private _handler: MouseHandler;

    private _polygonMode: PolygonMode = 'line';

    constructor(id: string, terrainData: {
        width: number,
        depth: number,
        heigts: number[];
    }) {
        const {width, depth, heigts} = terrainData;

        this._canvas = document.getElementById(id) as HTMLCanvasElement;
        
        const canvasWidth = this._canvas.width;
        const canvasHeight = this._canvas.height;
        
        this._canvas.width = canvasWidth * devicePixelRatio;
        this._canvas.height = canvasHeight * devicePixelRatio; 

        // Maintain the same canvas size, potentially downscaling it for HiDPI displays
        this._canvas.style.width = `${canvasWidth}px`;
        this._canvas.style.height = `${canvasHeight}px`;

        this._terrain = new BasicTerrain(width, depth, heigts);

        // create camera 일단 에러 무시 실행에는 지장 없음
        // this._camera = createCamera(this._canvas, {
        //     center: [0, 0, 0],
        //     up: [0.0, 1.0, 0.0],
        //     eye: [0, 500, -1000],
        //     zoomMax: 10,
        //     zoomSpeed: 2
        // });

        this._camera = new ArcballCamera({
            position: vec3.create(0, 500, -1000),
            target: vec3.create(0, 0, -0),
        });
        
        this._handler = new MouseHandler(this._canvas);

        console.log(this._camera);
    }

    public async render() {
        if (!this._initialized) await this._init();

        // if (this._camera.tick()) {
        //     return;
        // }

        console.log("draw!!!");

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

        // // model transformation
        // const center = this._terrain.getCenter();
        // const model = mat4.translation([-center.x, -center.y - 300, 0]);

        // // projection, viewing transformation
        // const fov = utils.degToRad(45);
        // const aspect = this._canvas.width / this._canvas.height;
        // const near = 0.1; 
        // const far = 2000;

        // // const eye = [0, 800, -500];
        // // const target = [0.0, 0.0, 1.0];
        // // const up = [0.0, 1.0, 0.0];

        // const persp = mat4.perspective(fov, aspect, near, far);

        // const camera = this._camera.matrix;
        // //mat4.lookAt(eye, target, up);
        // const projView = mat4.mul(persp, camera);

        const modelViewProjection = this._calcModelViewProjectionMatrix();

        device.queue.writeBuffer(this._uniformBuffer as GPUBuffer, 0, modelViewProjection as ArrayBuffer);

        renderPass.setPipeline(pipeline);

        renderPass.setVertexBuffer(0, this._vertexBuffer);
        renderPass.setIndexBuffer(this._indexBuffer, "uint32");

        renderPass.setBindGroup(0, this._bindGroup);

        renderPass.drawIndexed(indexCount);

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

        const pipeline = device.createRenderPipeline({
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
        this._pipeline = pipeline;

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

        const uniformBuffer = device.createBuffer({
            label: "terrain uniform buffer",
            size: 64, // float(4bytes) x 16 (=4x4 matrix)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // buffer 생성 후 반드시 unmap 필요
        new Float32Array(vertexBuffer.getMappedRange()).set(vertices);
        vertexBuffer.unmap();

        new Uint32Array(indexBuffer.getMappedRange()).set(indices);
        indexBuffer.unmap();


        this._vertexBuffer = vertexBuffer;
        this._indexBuffer = indexBuffer;
        this._uniformBuffer = uniformBuffer;

        // uniform binding
        this._bindGroup = device.createBindGroup({
            label: "terrain bind group",
            layout: pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: { buffer: uniformBuffer }
                }
            ]
        });

        console.log(this._vertexBuffer, this._indexBuffer);

        this._initialized = true;
    }


    /**
     * Model-View-Projection Matrix
     */

    private _modelViewProjectionMatrix = mat4.create();
    private _calcModelViewProjectionMatrix(deltaTime: number = 0) {
        // model transformation
        // const center = this._terrain.getCenter();
        // const model = mat4.translation([-center.x, -center.y - 300, 0]);

        // projection, viewing transformation
        const fov = utils.degToRad(45);
        const aspect = this._canvas.width / this._canvas.height;
        const near = 0.1; 
        const far = 2000;

        const projectionMatrix = mat4.perspective(fov, aspect, near, far);

        // const camera = this._camera.matrix;
        // mat4.lookAt(eye, target, up);
        // const projView = mat4.mul(persp, camera);

        const viewMatrix = this._camera.update(deltaTime, this._handler.analog);

        console.log(projectionMatrix);
        console.log(viewMatrix);

        mat4.multiply(projectionMatrix, viewMatrix, this._modelViewProjectionMatrix);

        return this._modelViewProjectionMatrix;
    }
}

export default TerrainDemo;