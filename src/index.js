/*
 * @Author: 毛毛
 * @Date: 2022-04-12 22:45:40
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-14 14:21:19
 */

import { initMixin } from "./init";
import { initLifeCycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";

/**
 * Vue构造函数
 * @param {*} options 用户选项
 */
function Vue(options) {
  // 初始化
  this._init(options);
}
Vue.prototype.$nextTick = nextTick
initMixin(Vue); // 扩展_init方法
initLifeCycle(Vue); // 拓展生命周期 进行组件的挂载和渲染的方法
export default Vue;
