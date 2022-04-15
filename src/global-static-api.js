import { mergeOptions } from "./utils/merge";

/*
 * @Author: 毛毛
 * @Date: 2022-04-15 20:40:36
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-15 20:51:17
 * 全局静态 api
 */
export function initGlobalStaticAPI(Vue) {
  Vue.options = {}; // 全局选项
  // 混入
  Vue.mixin = function mixin(mixin) {
    // 我们期望将用户的选项和全局的options进行合并
    // {} + mixin {created(){}} => {created:[fn]}
    this.options = mergeOptions(Vue.options, mixin);
    // console.log(this.options);
    return this;
  };
}

