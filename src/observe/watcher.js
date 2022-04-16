import Dep, { popWatcherTarget, pushWatcherTarget } from "./dep";

/*
 * @Author: 毛毛
 * @Date: 2022-04-15 09:09:45
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-16 12:55:37
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
   * @param {boolean|object} options 额外选项 true表示初次渲染 对象是额外的配置
   */
  constructor(vm, updateComponent, options) {
    if (typeof options === "boolean") this.renderWatcher = true;
    // 记录vm实例
    this.vm = vm;
    this.options = options;
    // 调用这个函数 意味着可以发生取值操作
    this.getter = updateComponent;
    // 收集 dep   watcher -> deps
    this.deps = []; // 在组件卸载的时候，清理响应式数据使用 还有实现响应式数据等都需要使用到
    this.depsId = new Set(); // dep id
    // 是否懒执行
    this.lazy = options?.lazy;
    // dirty  计算属性使用的
    this.dirty = this.lazy;
    console.log(this.lazy);
    // 初渲染
    this.lazy || this.get();
  }
  get() {
    /**
     * 1.当我们创建渲染watcher的时候 会把当前的渲染watcher放到Dep.target上
     * 2.调用_render()取值 走到值的get上
     */
    // Dep.target = this;
    pushWatcherTarget(this);
    // 去 vm上取值 这里的this不是vm了，所以取值需要绑定vm
    const val = this.getter.call(this.vm);
    // 渲染完毕后清空
    // Dep.target = null;
    popWatcherTarget();
    return val; // 计算属性执行的返回值
  }
  evaluate() {
    // 获取到用户函数的返回值(getter返回值) 并且标识数据不是脏的
    this.value = this.get();
    this.dirty = false;
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
    // 是计算属性
    if (this.lazy) {
      // 依赖的值变化 就标识计算属性的值是脏值了
      return this.dirty = true;
    }
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
  depend(){
    // 之前是属性dep记录watcher
    // 这里是watcher记录属性dep
    let i = this.deps.length;
    while(i--){
      // 让计算属性watcher收集上层watcher
      // curr dep -> prev watcher -> curr dep -> prev watcher
      // dep.depend() -> watcher.addDep(dep) -> dep.addSub(watcher)
      this.deps[i].depend()
    }
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
  console.log("observer-----------------");
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
