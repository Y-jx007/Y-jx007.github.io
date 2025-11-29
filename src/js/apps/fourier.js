import { initWebGPU, createBuffer, createShaderModule, createRenderPipeline } from '../utils/webgpu-utils.js';

const fourierShader = `
@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> @builtin(position) vec4<f32> {
    let x = f32(i32(in_vertex_index) - 1);
    let y = f32(i32(in_vertex_index & 1u) * 2 - 1);
    return vec4<f32>(x, y, 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(0.8, 0.2, 0.2, 1.0); // 红色三角形
}
`;

export default class FourierApp {
    constructor() {
        this.canvas = document.getElementById('webgpuCanvas');
        this.device = null;
        this.context = null;
        this.pipeline = null;
    }

    async init() {
        try {
            const { device, context, format } = await initWebGPU(this.canvas);
            this.device = device;
            this.context = context;
            
            // 设置画布大小
            this.resizeCanvas();
            
            // 创建渲染管道
            const vertexShader = createShaderModule(device, fourierShader);
            const fragmentShader = createShaderModule(device, fourierShader);
            this.pipeline = createRenderPipeline(device, format, vertexShader, fragmentShader);
            
            // 开始渲染循环
            this.render();
            
        } catch (error) {
            throw new Error(`Fourier应用初始化失败: ${error.message}`);
        }
    }

    resizeCanvas() {
        const container = document.getElementById('webgpuContainer');
        const maxWidth = container.clientWidth * 0.95;
        const maxHeight = container.clientHeight * 0.85;
        
        this.canvas.width = Math.min(800, maxWidth);
        this.canvas.height = Math.min(600, maxHeight);
    }

    async render() {
        if (!this.device || !this.context) return;
        
        const commandEncoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();
        
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.1, g: 0.2, b: 0.3, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store'
            }]
        });

        renderPass.setPipeline(this.pipeline);
        renderPass.draw(3, 1, 0, 0);
        renderPass.end();

        this.device.queue.submit([commandEncoder.finish()]);
        
        // 继续渲染循环
        requestAnimationFrame(() => this.render());
    }

    cleanup() {
        // 清理资源
        this.device = null;
        this.context = null;
        this.pipeline = null;
    }
}