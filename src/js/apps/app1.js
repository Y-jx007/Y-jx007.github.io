import { createShaderModule } from '../utils/webgpu-utils.js';

const triangleShader = `
@vertex
fn vs_main(@builtin(vertex_index) in_vertex_index: u32) -> @builtin(position) vec4<f32> {
    let x = f32(i32(in_vertex_index) - 1);
    let y = f32(i32(in_vertex_index & 1u) * 2 - 1);
    return vec4<f32>(x, y, 0.0, 1.0);
}

@fragment
fn fs_main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
`;

export class App1 {
    constructor(device, context, format) {
        this.device = device;
        this.context = context;
        this.format = format;
        this.pipeline = null;
    }

    async init() {
        this.pipeline = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: {
                module: createShaderModule(this.device, triangleShader),
                entryPoint: 'vs_main'
            },
            fragment: {
                module: createShaderModule(this.device, triangleShader),
                entryPoint: 'fs_main',
                targets: [{
                    format: this.format
                }]
            },
            primitive: {
                topology: 'triangle-list'
            }
        });
    }

    async render() {
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
    }
}