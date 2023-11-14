// workerManager.js
class WorkerManager {
  static instance;

  constructor() {
    if (!WorkerManager.instance) {
      if (typeof window !== 'undefined') {
        this.worker = new Worker(new URL('./webWorker.js', import.meta.url));
        WorkerManager.instance = this;
      }
    }

    return WorkerManager.instance;
  }

  postMessage(message) {
    this.worker?.postMessage(message);
  }

  terminate() {
    this.worker?.terminate();
  }

  onMessage(handler) {
    this.worker.onmessage = handler;
  }

  onError(handler) {
    this.worker.onerror = handler;
  }
}

const instance = new WorkerManager();
Object.freeze(instance);

export default instance;
