/*
 * @Author: 毛毛
 * @Date: 2022-04-12 22:45:40
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-15 20:42:57
 */

import { initGlobalStaticAPI } from "./global-static-api";
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
// TODO 暂时先这样写
Vue.prototype.$nextTick = nextTick;
initMixin(Vue); // 扩展_init方法
initLifeCycle(Vue); // 拓展生命周期 进行组件的挂载和渲染的方法

// 静态方法
initGlobalStaticAPI(Vue);

export default Vue;
