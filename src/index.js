/*
 * @Author: 毛毛
 * @Date: 2022-04-12 22:45:40
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-17 20:15:15
 */

import { initGlobalStaticAPI } from "./global-static-api";
import { initMixin } from "./init";
import { initStateMixin } from "./initState";
import { initLifeCycle } from "./lifecycle";

/**
 * Vue构造函数
 * @param {*} options 用户选项
 */
function Vue(options) {
  // 初始化
  this._init(options);
}

initMixin(Vue); // 扩展_init方法
// vm._update vm._render vm._c vm._v vm._s
initLifeCycle(Vue); // 拓展生命周期 进行组件的挂载和渲染的方法

// 静态方法
initGlobalStaticAPI(Vue);

// Vue.$nextTick vm.$watch
initStateMixin(Vue);



export default Vue;
