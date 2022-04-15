/*
 * @Author: 毛毛
 * @Date: 2022-04-13 08:51:06
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-15 10:40:59
 */
import { isObject } from "../utils";
import arrayProto from "./array";
import Dep from "./dep";
class Observe {
  constructor(data) {
    // 记录this 也是一个标识 如果对象上有了该属性 标识已经被观测
    Object.defineProperty(data, "__ob__", {
      value: this, // observe的实例
    });
    // 如果劫持的数据是数组
    if (Array.isArray(data)) {
      // 重写数组上的7个方法 这7个变异方法是可以修改数组本身的
      Object.setPrototypeOf(data, arrayProto);
      // 对于数组元素是 引用类型的，需要深度观测的
      this.observeArray(data);
    } else {
      // Object.defineProperty 只能劫持已经存在的属性（vue提供单独的api $set $delete 为了增加新的响应式属性）
      this.walk(data);
    }
  }
  /**
   * 循环对象 对属性依次劫持 重新‘定义’属性
   * @param {*} data
   */
  walk(data) {
    Object.keys(data).forEach((key) => defineReactive(data, key, data[key]));
  }
  /**
   * 劫持数组元素 是普通原始值不会劫持
   * @param {Array} data
   */
  observeArray(data) {
    data.forEach((item) => observe(item));
  }
}
/**
 * 定义目标对象上的属性为响应式
 * @param {Object} obj
 * @param {string|symbol} key
 * @param {*} value
 */
export function defineReactive(obj, key, value) {
  // 如果属性也是对象 再次劫持
  observe(value);
  // 每个属性都有一个dep
  let dep = new Dep();
  Object.defineProperty(obj, key, {
    get() {
      // 判断 Dep.target
      if (Dep.target) {
        // 当前属性 记住这个watcher 也就是视图依赖的收集
        dep.depend();
      }
      return value;
    },
    set(newVal) {
      if (newVal === value) return;
      // 新值是对象 则需要重新观测
      observe(newVal);
      value = newVal;
      // 更新数据 通知视图更新
      dep.notify();
    },
  });
}

/**
 * 数据劫持方法
 * @param {*} data 需要劫持的数据
 */
export function observe(data) {
  // 不是对象 不需要劫持
  if (!isObject(data)) return;
  // 如果一个对象被劫持过了，那么不需要再次被劫持了
  if (data.__ob__ instanceof Observe) return data.__ob__;
  // console.log("observe---------------->", data);
  return new Observe(data);
}
