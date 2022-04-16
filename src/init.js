/*
 * @Author: 毛毛
 * @Date: 2022-04-12 22:48:39
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-16 10:31:11
 */
import { initState } from "./initState";
import { compileToFunction } from "./compiler";
import { mountComponent } from "./lifecycle";
import { mergeOptions } from "./utils/merge";
import { callHook } from "./hooks/life-hook";
export function initMixin(Vue) {
  /**
   * 初始化操作
   * @param {*} options
   */
  Vue.prototype._init = function _init(options) {
    // console.log("init------------>", options);
    // vue app.$options = options 获取用户配置
    const vm = this;
    // 合并 Vue.options 和 传入的配置项
    // TODO 目前还只是可以合并生命周期和普通属性等，对于 data 这种选项还需要特殊的合并处理
    vm.$options = mergeOptions(this.constructor.options, options); // vue认为 $xxx 就是表示vue的属性
    console.log(vm.$options);
    // 执行初始化之前，执行 beforeCreate 的钩子
    callHook(vm, "beforeCreate");
    // 初始化状态
    // TODO computed methods watcher ....
    initState(vm);
    // 状态初始化完毕之后，执行 created 钩子
    callHook(vm, "created");
    // TODO 编译模板 等...
    // el vm挂载到的dom容器
    if (options.el) vm.$mount(options.el);
  };
  Vue.prototype.$mount = function $mount(el) {
    const vm = this;
    const ops = vm.$options;
    el = document.querySelector(el);
    let template;
    // 是否有render函数
    // 没有render
    if (!ops.render) {
      // 没有template选项 但是写了el 直接用el作为模板
      if (!ops.template && el) template = el.outerHTML;
      else if (el) template = ops.template;
    }
    // 有template 直接用模板
    if (template) {
      // TODO 去除开头和结尾的空白符 m是忽略换行 进行多行匹配
      // template = template.trim();
      template = template.replace(/^\s+|\s+$/gm, "");
      // 编译模板 生成 render函数
      const render = compileToFunction(template);
      ops.render = render;
    }
    // console.log("$mount template-------------->", template);
    // 调用 render 实现页面渲染
    // console.log(ops.render);
    // 组件的挂载
    mountComponent(vm, el);
    /**
     * script 标签引用的是vue.global.js 这个编译过程是在浏览器运行的
     * runtime是不包含模板编译的，整个编译打包的时候是通过loader来转义.vue文件的
     * 用runtime的时候 不能使用模板template（可以使用.vue，loader处理就行了）
     */
  };
}
