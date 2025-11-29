export class AppManager {
    constructor() {
        this.apps = new Map();
    }

    registerApp(id, appClass) {
        this.apps.set(id, appClass);
    }

    getApp(id) {
        return this.apps.get(id);
    }

    getAllApps() {
        return Array.from(this.apps.values());
    }
}