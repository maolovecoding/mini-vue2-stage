import Dep from "./dep";

/*
 * @Author: 毛毛
 * @Date: 2022-04-15 09:09:45
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-15 14:54:49
 * 封装视图的渲染逻辑 watcher
 */
let id = 0;
/**
 * watcher 进行实际的视图渲染
 * 每个组件都有自己的watcher，可以减少每次更新页面的部分
 * 给每个属性都增加一个dep，目的就是收集watcher
 * 一个视图（组件）可能有很多属性，多个属性对应一个视图 n个dep对应1个watcher
 * 一个属性也可能对应多个视图（组件）
 * 所以 dep 和 watcher 是多对多关系
 *
 * 每个属性都有自己的dep，属性就是被观察者
 * watcher就是观察者（属性变化了会通知观察者进行视图更新）-> 观察者模式
 */
class Watcher {
  // 目前只有一个watcher实例 因为我只有一个实例 根组件
  id = id++;
  /**
   *
   * @param {*} vm 组件实例
   * @param {*} updateComponent 渲染页面的回调函数
   * @param {boolean} options 是否是初渲染
   */
  constructor(vm, updateComponent, options) {
    this.renderWatcher = options;
    // 调用这个函数 意味着可以发生取值操作
    this.getter = updateComponent;
    // 收集 dep   watcher -> deps
    this.deps = []; // 在组件卸载的时候，清理响应式数据使用 还有实现响应式数据等都需要使用到
    this.depsId = new Set(); // dep id
    // 初渲染
    this.get();
  }
  get() {
    /**
     * 1.当我们创建渲染watcher的时候 会把当前的渲染watcher放到Dep.target上
     * 2.调用_render()取值 走到值的get上
     */
    Dep.target = this;
    // 去 vm上取值
    this.getter();
    // 渲染完毕后清空
    Dep.target = null;
  }
  /**
   * 一个组件对应多个属性 但是重复的属性 也不需要记录
   * 比如在组件视图中 用到了多次的name属性，那么需要记录每次用到name的watcher吗
   * @param {*} dep
   */
  addDep(dep) {
    // dep去重 可以用到 dep.id
    const id = dep.id;
    if (!this.depsId.has(id)) {
      // watcher记录dep
      this.deps.push(dep);
      this.depsId.add(id);
      // dep记录watcher
      dep.addSub(this);
    }
  }
  /**
   * 更新视图 本质重新执行 render函数
   */
  update() {
    // 同步更新视图 改为异步更新视图
    // this.get();
    // 把当前的watcher暂存
    queueWatcher(this);
    console.log("update watcher.................");
  }
  /**
   * 实际刷新视图的操作 执行render用到的都是实例最新的属性值
   */
  run() {
    console.log("run------------------");
    this.get();
  }
}
// watcher queue 本次需要更新的视图队列
let queue = [];
// watcher 去重  {0:true,1:true}
let has = {};
// 批处理 也可以说是防抖
let pending = false;
/**
 * 不管执行多少次update操作，但是我们最终只执行一轮刷新操作
 * @param {*} watcher
 */
function queueWatcher(watcher) {
  const id = watcher.id;
  // 去重
  if (!has[id]) {
    queue.push(watcher);
    has[id] = true;
    console.log(queue);
    if (!pending) {
      // 刷新队列 多个属性刷新 其实执行的只是第一次 合并刷新了
      // setTimeout(flushSchedulerQueue, 0);
      // 将刷新队列的执行和用户回调的执行都放到一个微任务中
      nextTick(flushSchedulerQueue);
      pending = true;
    }
  }
}
/**
 * 刷新调度队列 且清理当前的标识 has pending 等都重置
 * 先执行第一批的watcher，如果刷新过程中有新的watcher产生，再次加入队列即可
 */
function flushSchedulerQueue() {
  const flushQueue = [...queue];
  queue = [];
  has = {};
  pending = false;
  // 刷新视图 如果在刷新过程中 还有新的watcher 会重新放到queueWatcher中
  flushQueue.forEach((watcher) => watcher.run());
}
// 任务队列
let callbacks = [];
// 是否等待任务刷新
let waiting = false;
/**
 * 刷新异步回调函数队列
 */
function flushCallbacks() {
  const cbs = [...callbacks];
  callbacks = [];
  waiting = false;
  cbs.forEach((cb) => cb());
}
/**
 * 优雅降级  Promise -> MutationObserve -> setImmediate -> setTimeout(需要开线程 开销最大)
 */
let timerFunc = null;
if (Promise) {
  timerFunc = () => Promise.resolve().then(flushCallbacks);
} else if (MutationObserver) {
  // 创建并返回一个新的 MutationObserver 它会在指定的DOM发生变化时被调用（异步执行callback）。
  const observer = new MutationObserver(flushCallbacks);
  // TODO 创建文本节点的API 应该封装 为了方便跨平台
  const textNode = document.createTextNode(1);
  console.log("observer-----------------")
  // 监控文本值的变化
  observer.observe(textNode, {
    characterData: true,
  });
  timerFunc = () => (textNode.textContent = 2);
} else if (setImmediate) {
  // IE平台
  timerFunc = () => setImmediate(flushCallbacks);
} else {
  timerFunc = () => setTimeout(flushCallbacks, 0);
}
/**
 * 异步批处理
 * 是先执行内部的回调 还是用户的？ 用个队列 排序
 * @param {Function} cb 回调函数
 */
export function nextTick(cb) {
  // 使用队列维护nextTick中的callback方法
  callbacks.push(cb);
  if (!waiting) {
    // setTimeout(flushCallbacks, 0); // 刷新
    // 使用vue的原理 优雅降级
    timerFunc();
    waiting = true;
  }
}

export default Watcher;
