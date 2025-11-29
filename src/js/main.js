import { AppManager } from './utils/app-manager.js';

// 应用数据
const APPS_DATA = [
    {
        id: 'fourier',
        title: 'Fourier',
        description: '绘制图形并查看其傅里叶变换',
        enabled: true,
        module: './src/js/apps/fourier.js'
    },
    {
        id: 'arnold',
        title: 'Arnold',
        description: '可视化图像猫变换',
        enabled: true,
        module: './src/js/apps/arnold.js'
    },
    {
        id: 'complex-plot',
        title: '幅角图',
        description: '在复平面上可视化复变函数',
        enabled: true,
        module: './src/js/apps/complex-plot.js'
    },
    {
        id: 'maxwell',
        title: 'Maxwell',
        description: '模拟气体分子速率分布',
        enabled: true,
        module: './src/js/apps/maxwell.js'
    },
    {
        id: 'ising',
        title: 'Ising',
        description: '模拟二维伊辛模型',
        enabled: true,
        module: './src/js/apps/ising.js'
    },
    {
        id: 'turing',
        title: 'Turing',
        description: '模拟Gray-Scott反应扩散系统生成图灵斑的过程',
        enabled: true,
        module: './src/js/apps/turing.js'
    },
    {
        id: 'dla',
        title: 'DLA分形',
        description: '模拟扩散限制聚集系统生成分形的过程',
        enabled: true,
        module: './src/js/apps/dla.js'
    },
    {
        id: 'mandelbrot-julia',
        title: 'Mandelbrot-Julia',
        description: '复动力系统生成分形',
        enabled: true,
        module: './src/js/apps/mandelbrot-julia.js'
    },
    {
        id: 'newton',
        title: 'Newton',
        description: '牛顿迭代法生成分形',
        enabled: true,
        module: './src/js/apps/newton.js'
    },
    {
        id: 'lindenmayer',
        title: 'Lindenmayer',
        description: '林氏系统分形',
        enabled: true,
        module: './src/js/apps/lindenmayer.js'
    },
    {
        id: 'lfs-fractal',
        title: 'LFS分形',
        description: '迭代函数系统生成分形图案',
        enabled: true,
        module: './src/js/apps/lfs-fractal.js'
    },
    {
        id: 'logistic-fractal',
        title: 'Logistic分形',
        description: '逻辑映射生成分形图案',
        enabled: true,
        module: './src/js/apps/logistic-fractal.js'
    },
    {
        id: 'lloyd',
        title: 'Lloyd',
        description: '用Voronoi图的Lloyd松弛过程模拟蜂巢结构的形成',
        enabled: true,
        module: './src/js/apps/lloyd.js'
    },
    {
        id: 'lbm-fluid',
        title: 'LBM流体',
        description: 'GKB松弛的格子Boltzmann方法模拟Karman涡街',
        enabled: true,
        module: './src/js/apps/lbm-fluid.js'
    },
    {
        id: 'boids',
        title: 'Boids',
        description: '模拟鸟群、鱼群等的自组织行为',
        enabled: true,
        module: './src/js/apps/boids.js'
    },
    {
        id: 'tsp',
        title: '旅商问题',
        description: '使用遗传算法解决旅行商问题',
        enabled: true,
        module: './src/js/apps/tsp.js'
    },
    {
        id: 'conway',
        title: 'Conway',
        description: '模拟和可视化生命游戏',
        enabled: true,
        module: './src/js/apps/conway.js'
    },
    {
        id: 'chaldni',
        title: 'Chaldni',
        description: '模拟平板沙粒振动形成的图案',
        enabled: true,
        module: './src/js/apps/chaldni.js'
    }
];

class ApplicationLauncher {
    constructor() {
        this.appManager = new AppManager();
        this.currentApp = null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.createAppCards();
        this.checkWebGPUSupport();
    }

    setupEventListeners() {
        // 关闭错误模态框
        document.getElementById('closeErrorModal').addEventListener('click', () => {
            this.hideModal('errorModal');
        });

        // 关闭应用按钮
        document.getElementById('closeApp').addEventListener('click', () => {
            this.closeCurrentApp();
        });

        // 窗口调整大小时重新排列卡片
        window.addEventListener('resize', () => {
            this.arrangeCards();
        });
    }

    createAppCards() {
        const container = document.getElementById('cardsContainer');
        
        APPS_DATA.forEach(appData => {
            const card = this.createAppCard(appData);
            container.appendChild(card);
        });
        
        this.arrangeCards();
    }

    createAppCard(appData) {
        const card = document.createElement('div');
        card.className = `app-card ${appData.enabled ? '' : 'disabled'}`;
        card.id = `card-${appData.id}`;
        
        card.innerHTML = `
            <div class="card-title">${appData.title}</div>
            <div class="card-description">${appData.description}</div>
            <button class="card-button ${appData.enabled ? 'btn-primary' : 'btn-disabled'}" 
                    ${!appData.enabled ? 'disabled' : ''}>
                ${appData.enabled ? '启动' : '开发中'}
            </button>
        `;
        
        if (appData.enabled) {
            const button = card.querySelector('.card-button');
            button.addEventListener('click', () => {
                this.launchApp(appData);
            });
        }
        
        return card;
    }

    arrangeCards() {
        // 在CSS Grid中，卡片会自动排列，这里主要处理响应式调整
        // 如果需要更复杂的布局逻辑，可以在这里实现
    }

    async launchApp(appData) {
        try {
            this.showLoading(`正在启动 ${appData.title}...`);
            
            // 动态导入应用模块
            const appModule = await import(appData.module);
            
            // 创建应用实例
            this.currentApp = new appModule.default();
            
            // 初始化应用
            await this.currentApp.init();
            
            // 显示WebGPU画布
            this.showWebGPUContainer();
            
            this.hideLoading();
            
        } catch (error) {
            console.error(`启动应用 ${appData.title} 失败:`, error);
            this.showError(`无法启动 ${appData.title}: ${error.message}`);
        }
    }

    closeCurrentApp() {
        if (this.currentApp) {
            this.currentApp.cleanup();
            this.currentApp = null;
        }
        this.hideWebGPUContainer();
    }

    showWebGPUContainer() {
        document.getElementById('webgpuContainer').style.display = 'flex';
    }

    hideWebGPUContainer() {
        document.getElementById('webgpuContainer').style.display = 'none';
    }

    showLoading(message = '加载中...') {
        document.getElementById('loadingMessage').textContent = message;
        document.getElementById('loadingModal').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingModal').style.display = 'none';
    }

    showError(message) {
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorModal').style.display = 'flex';
        this.hideLoading();
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    async checkWebGPUSupport() {
        if (!navigator.gpu) {
            this.showError('您的浏览器不支持 WebGPU。请使用 Chrome 113+ 或 Edge 113+。');
            return false;
        }
        return true;
    }
}

// 初始化应用启动器
document.addEventListener('DOMContentLoaded', () => {
    new ApplicationLauncher();
});