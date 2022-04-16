/*
 * @Author: 毛毛
 * @Date: 2022-04-13 08:51:06
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-16 20:33:36
 */
import { isObject } from "../utils";
import arrayProto from "./array";
import Dep from "./dep";
class Observe {
  constructor(data) {
    // 让引用数据自身也实现依赖收集 这个dep是放在 data.__ob__ = this 上的
    // 也就是说 data.__ob__.dep 并不是 data.dep 所以不会发生重复
    this.dep = new Dep();
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
// vue2 应用了defineProperty需要一加载的时候 就进行递归操作，所以好性能，如果层次过深也会浪费性能
// 1.性能优化的原则：
// 1) 不要把所有的数据都放在data中，因为所有的数据都会增加get和set
// 2) 不要写数据的时候 层次过深， 尽量扁平化数据
// 3) 不要频繁获取数据
// 4) 如果数据不需要响应式 可以使用Object.freeze 冻结属性
/**
 * vue2 慢的原因 主要在这个方法中
 * 定义目标对象上的属性为响应式
 * @param {Object} obj
 * @param {string|symbol} key
 * @param {*} value
 */
export function defineReactive(obj, key, value) {
  // 如果属性也是对象 再次劫持 childOb有值的情况下是Observe实例，实例上挂载了dep
  const childOb = observe(value);
  // 每个属性都有一个dep
  let dep = new Dep();
  Object.defineProperty(obj, key, {
    get() {
      // 判断 Dep.target
      if (Dep.target) {
        // 让数组自身 和 对象自身 都能实现依赖收集
        if (childOb) {
          // 来到这里，表名 value是引用类型，且如果是数组，循环看数组元素是否是数组
          // 如果还是数组 则需要收集依赖
          childOb.dep.depend();
          // TODO 深度实现依赖收集 对于数组元素还是数组的情况，需要让此元素自身也进行依赖收集
          if (Array.isArray(value)) dependArray(value);
        }
        // 当前属性 记住这个watcher 也就是视图依赖的收集
        dep.depend();
      }
      // console.log("----------------dep.get----------------",key)
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

/**
 * 给对象属性或者数组元素是数组的，进行依赖收集
 * 深层次嵌套会递归，递归太多性能差，不存在的属性监控不到，存在的属性要重写方法 vue3->proxy
 * @param {*} arr
 */
function dependArray(arr) {
  // console.log(arr);
  for (let i = 0; i < arr.length; i++) {
    const cur = arr[i];
    // console.log(cur, cur.__ob__);
    // 数组元素可能不是数组了
    if (Array.isArray(cur)) {
      // 收集依赖
      cur.__ob__.dep.depend();
      dependArray(cur);
    }
  }
}
// 1.默认vue在初始化的时候 会对对象每一个属性都进行劫持，增加dep属性， 当取值的时候会做依赖收集
// 2.默认还会对属性值是（对象和数组的本身进行增加dep属性） 进行依赖收集
// 3.如果是属性变化 触发属性对应的dep去更新
// 4.如果是数组更新，触发数组的本身的dep 进行更新
// 5.如果取值的时候是数组还要让数组中的对象类型也进行依赖收集 （递归依赖收集）
// 6.如果数组里面放对象，默认对象里的属性是会进行依赖收集的，因为在取值时 会进行JSON.stringify操作
