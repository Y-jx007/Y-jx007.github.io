import { App1 } from './apps/app1.js';
import { initWebGPU } from './utils/webgpu-utils.js';

class MainApplication {
    constructor() {
        this.canvas = document.getElementById('webgpu-canvas');
        this.device = null;
        this.context = null;
        this.currentApp = null;
        
        this.init();
    }

    async init() {
        try {
            const { device, context, format } = await initWebGPU(this.canvas);
            this.device = device;
            this.context = context;
            
            // 初始化应用
            this.currentApp = new App1(this.device, this.context, format);
            await this.currentApp.init();
            
            // 隐藏加载提示
            document.getElementById('loading').style.display = 'none';
            
            // 开始渲染循环
            this.render();
            
        } catch (error) {
            console.error('初始化失败:', error);
            this.showError(error.message);
        }
    }

    async render() {
        if (!this.currentApp) return;
        
        await this.currentApp.render();
        requestAnimationFrame(() => this.render());
    }

    showError(message) {
        const loading = document.getElementById('loading');
        loading.style.display = 'none';
        
        const errorDiv = document.getElementById('error');
        errorDiv.style.display = 'block';
        errorDiv.innerHTML = `WebGPU 错误: ${message}<br>请使用支持 WebGPU 的浏览器，如 Chrome 113+ 或 Edge 113+`;
    }
}

// 启动应用
new MainApplication();