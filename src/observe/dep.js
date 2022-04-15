/*
 * @Author: 毛毛
 * @Date: 2022-04-15 09:31:54
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-15 10:41:29
 * 依赖收集 dep
 */
let id = 0;
class Dep {
  id = id++;
  constructor() {
    // 属性的dep要收集watcher
    this.subs = [];
  }
  /**
   * 收集当前属性 对应的视图 watcher
   */
  depend() {
    // 这里我们不希望收集重复的watcher，而且现在还只是单向的关系 dep -> watcher
    // watcher 也需要记录 dep
    // this.subs.push(Dep.target);
    // console.log(this.subs);
    // 这里是让watcher先记住dep
    Dep.target.addDep(this); //  this -> dep
  }
  /**
   * dep 在反过来记录watcher
   * @param {*} watcher
   */
  addSub(watcher) {
    this.subs.push(watcher);
    console.log(watcher);
  }
  /**
   * 更新视图
   */
  notify() {
    this.subs.forEach((watcher) => watcher.update());
  }
  // 当前的watcher
  static target = null;
}
export default Dep;
