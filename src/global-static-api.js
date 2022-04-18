import { isFunction } from "./utils";
import { mergeOptions } from "./utils/merge";

/*
 * @Author: 毛毛
 * @Date: 2022-04-15 20:40:36
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-18 13:30:21
 * 全局静态 api
 */
export function initGlobalStaticAPI(Vue) {
  Vue.options = {}; // 全局选项
  // 缓存 Vue构造函数
  Object.defineProperty(Vue.options, "_base", {
    value: Vue,
    // 为了可以混入到所有实例的选项中 需要可枚举
    enumerable: true,
  });
  // 混入
  Vue.mixin = function mixin(mixin) {
    // 我们期望将用户的选项和全局的options进行合并
    // {} + mixin {created(){}} => {created:[fn]}
    this.options = mergeOptions(Vue.options, mixin);
    // console.log(this.options);
    return this;
  };
  /**
   * 使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。
   * 返回值是一个构造函数 通过new可以创建一个vue组件实例
   * @param {{data:Function,el:string}} options
   * @returns
   */
  Vue.extend = function extend(options) {
    // 组合式继承 Vue
    function Sub(options = {}) {
      // 最终使用的组件 就是 new 一个实例
      this._init(options);
    }
    Sub.prototype = Object.create(Vue.prototype);
    Object.defineProperty(Sub.prototype, "constructor", {
      value: Sub,
      writable: true,
      configurable: true,
    });
    // 保存用户传递的选项 且和全局的配置合并
    Sub.options = mergeOptions(Vue.options, options);
    return Sub;
  };
  // 维护一个 全局组件对象
  Vue.options.components = {};
  /**
   * 定义或者获取全局组件 没有获取到组件时 返回 undefined
   * @param {string} id
   * @param {Function | object} definition
   */
  Vue.component = function component(id, definition) {
    // 获取全局组件
    if (!definition) return Vue.options[id];
    // 如果 definition 是一个函数，说明用户自己调用了 Vue.extend
    // 不是函数 就用 extend函数包装一下
    !isFunction(definition) && (definition = Vue.extend(definition));
    Vue.options.components[id] = definition;
  };
}
