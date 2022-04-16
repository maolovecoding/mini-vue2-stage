/*
 * @Author: 毛毛
 * @Date: 2022-04-13 10:02:33
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-16 17:40:23
 * @Description 重写数组中的变异方法
 */
let oldArrayProto = Array.prototype;

let newArrayProto = Object.create(oldArrayProto);
/**
 * 七个变异方法 会改变数组本身的方法
 * @type {Array<string>}
 */
const methods = [
  "push",
  "pop",
  "unshift",
  "shift",
  "reverse",
  "sort",
  "splice",
];
methods.forEach((method) => {
  // 重写数组的方法 内部调用的还是原来的方法
  // 函数的劫持 切片编程
  newArrayProto[method] = function (...args) {
    // 如果新增的数组元素是对象 需要再次劫持
    let inserted;
    // Observe实例
    const ob = this.__ob__;
    switch (method) {
      case "push":
      case "unshift": // 插入元素
        // 新增的元素 可能是对象
        inserted = args;
        break;
      case "splice": // 数组最强方法 splice(start, delCount, ...新增元素)
        inserted = args.slice(2); // 新增的元素
        break;
      default:
        break;
    }
    console.log("新增的内容------------------>", inserted);
    if (inserted) {
      // 观测新增的内容
      ob.observeArray(inserted);
    }
    console.log(`重写的${method}方法被调用------> this = `, this);
    const res = oldArrayProto[method].call(this, ...args);
    // 通知更新 dep -> watcher -> 视图更新
    ob.dep.notify();
    return res;
  };
});
export default newArrayProto;
