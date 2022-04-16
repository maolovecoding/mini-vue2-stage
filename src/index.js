/*
 * @Author: 毛毛
 * @Date: 2022-04-12 22:45:40
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-16 16:49:01
 */

import { initGlobalStaticAPI } from "./global-static-api";
import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";

/**
 * Vue构造函数
 * @param {*} options 用户选项
 */
function Vue(options) {
  // 初始化
  this._init(options);
}
// TODO 暂时先这样写
Vue.prototype.$nextTick = nextTick;
initMixin(Vue); // 扩展_init方法
initLifeCycle(Vue); // 拓展生命周期 进行组件的挂载和渲染的方法

// 静态方法
initGlobalStaticAPI(Vue);

// watch的底层实现 全是通过$watch
Object.defineProperty(Vue.prototype, "$watch", {
  /**
   * watch的实现 也是使用观察者模式
   * @param {Function|string} exprOrFn 监控的值
   * @param {*} callback 回调函数
   * @param {*} options 选项
   */
  value(exprOrFn, callback, options = {}) {
    // console.log(exprOrFn, callback);
    // 创建观察者 user属性 表名这是用户自己定义的watch
    // 侦听的属性值发生改变 直接执行callback即可
    new Watcher(this, exprOrFn, { user: true, ...options }, callback);
  },
});

export default Vue;
