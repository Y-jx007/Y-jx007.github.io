export default class RobustWebGPU {
    constructor() {
        this.canvas = null;
        this.device = null;
        this.context = null;
        this.pipeline = null;
    }

    async init() {
        try {
            console.log('RobustWebGPU: 开始初始化');
            
            this.canvas = document.getElementById('webgpuCanvas');
            if (!this.canvas) {
                throw new Error('未找到画布元素');
            }
            
            console.log('RobustWebGPU: 找到画布');
            
            // 设置画布大小
            this.canvas.width = 800;
            this.canvas.height = 600;
            console.log('RobustWebGPU: 画布大小设置为', this.canvas.width, 'x', this.canvas.height);
            
            // 检查 WebGPU 支持
            if (!navigator.gpu) {
                throw new Error('WebGPU 不被支持');
            }
            
            // 获取适配器
            const adapter = await navigator.gpu.requestAdapter();
            if (!adapter) {
                throw new Error('无法获取 WebGPU 适配器');
            }
            
            // 获取设备
            this.device = await adapter.requestDevice();
            console.log('RobustWebGPU: 设备获取成功');
            
            // 配置上下文
            this.context = this.canvas.getContext('webgpu');
            const format = navigator.gpu.getPreferredCanvasFormat();
            
            this.context.configure({
                device: this.device,
                format: format,
                alphaMode: 'premultiplied'
            });
            
            console.log('RobustWebGPU: 上下文配置成功');
            
            // 创建着色器
            const shaderCode = `
                @vertex
                fn vertex_main(@builtin(vertex_index) vertex_index: u32) -> @builtin(position) vec4f {
                    var pos = array<vec2f, 3>(
                        vec2f(0.0, 0.5),
                        vec2f(-0.5, -0.5),
                        vec2f(0.5, -0.5)
                    );
                    return vec4f(pos[vertex_index], 0.0, 1.0);
                }

                @fragment
                fn fragment_main() -> @location(0) vec4f {
                    return vec4f(1.0, 0.0, 0.0, 1.0);
                }
            `;
            
            const shaderModule = this.device.createShaderModule({
                code: shaderCode
            });
            
            // 创建渲染管道
            this.pipeline = this.device.createRenderPipeline({
                layout: 'auto',
                vertex: {
                    module: shaderModule,
                    entryPoint: 'vertex_main'
                },
                fragment: {
                    module: shaderModule,
                    entryPoint: 'fragment_main',
                    targets: [{
                        format: format
                    }]
                },
                primitive: {
                    topology: 'triangle-list'
                }
            });
            
            console.log('RobustWebGPU: 管道创建成功');
            
            // 开始渲染
            this.render();
            console.log('RobustWebGPU: 初始化完成');
            
        } catch (error) {
            console.error('RobustWebGPU: 初始化失败', error);
            
            // 如果 WebGPU 失败，回退到 2D
            this.fallbackTo2D();
        }
    }

    render() {
        if (!this.device || !this.context) return;
        
        console.log('RobustWebGPU: 开始渲染');
        
        const commandEncoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();
        
        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: [0.1, 0.2, 0.3, 1.0],
                loadOp: 'clear',
                storeOp: 'store'
            }]
        });
        
        renderPass.setPipeline(this.pipeline);
        renderPass.draw(3);
        renderPass.end();
        
        this.device.queue.submit([commandEncoder.finish()]);
        
        console.log('RobustWebGPU: 渲染完成');
    }

    fallbackTo2D() {
        console.log('RobustWebGPU: 回退到2D渲染');
        
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        // 绘制红色三角形
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(this.canvas.width / 2, 100);
        ctx.lineTo(100, 500);
        ctx.lineTo(700, 500);
        ctx.closePath();
        ctx.fill();
        
        // 添加说明文字
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('WebGPU 版本 - 红色三角形', this.canvas.width / 2, 50);
    }

    cleanup() {
        console.log('RobustWebGPU: 清理资源');
        this.device = null;
        this.context = null;
        this.pipeline = null;
    }
}