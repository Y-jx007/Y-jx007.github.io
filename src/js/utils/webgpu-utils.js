export async function initWebGPU(canvas) {
    if (!navigator.gpu) {
        throw new Error('WebGPU 不被支持，请使用 Chrome 113+ 或 Edge 113+');
    }

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw new Error('无法获取 WebGPU 适配器');
    }

    const device = await adapter.requestDevice();
    
    const context = canvas.getContext('webgpu');
    const format = navigator.gpu.getPreferredCanvasFormat();
    
    context.configure({
        device: device,
        format: format,
        alphaMode: 'premultiplied'
    });

    return { device, context, format };
}

export function createBuffer(device, data, usage) {
    const buffer = device.createBuffer({
        size: data.byteLength,
        usage: usage,
        mappedAtCreation: true
    });
    new data.constructor(buffer.getMappedRange()).set(data);
    buffer.unmap();
    return buffer;
}

export function createShaderModule(device, code) {
    return device.createShaderModule({
        code: code
    });
}