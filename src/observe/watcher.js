import Dep from "./dep";

/*
 * @Author: 毛毛
 * @Date: 2022-04-15 09:09:45
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-15 10:46:29
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
    this.get();
    console.log("update watcher.................")
  }
}

export default Watcher;
