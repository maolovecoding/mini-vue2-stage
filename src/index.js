/*
 * @Author: 毛毛
 * @Date: 2022-04-12 22:45:40
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-17 16:49:16
 */

import { compileToFunction } from "./compiler";
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

// ------------------- 测试vnode diff算法 ------------------------
import {
  patch,
  createEle,
  patchProps,
  createElement,
  createTextNode,
  appendChild,
  setAttribute,
  removeChild,
  insertBefore,
} from "./vdom/patch";
let render1 = compileToFunction(`<ul>
  <li key="a">1</li>
  <li key="b">2</li>
  <li key="c">3</li>
  <li key="d">4</li>
</ul>`);
const vm1 = new Vue({
  data: {
    name: "vnode1",
  },
});
let oldVNode = render1.call(vm1);
console.log(oldVNode);
let el1 = createEle(oldVNode);
setTimeout(() => document.body.appendChild(el1), 100);

let render2 = compileToFunction(`<ul>
<li key="g">6</li>
<li key="f">5</li>
<li key="h">7</li>
<li key="a">1</li>
<li key="c">3</li>
<li key="b">2</li>
</ul>`);
const vm2 = new Vue({
  data: {
    name: "vnode2",
  },
});
let newVNode = render2.call(vm2);
let newEL = createEle(newVNode);
// setTimeout(() => el1.parentNode.replaceChild(newEL,el1), 2000);
console.log(newVNode);
/**
 * 直接将新节点替换老节点，很消耗性能
 * 所以我们不直接替换，而是在比较两个节点之间的区别之后在替换，这就是diff算法
 * diff算是 是一个平级比较的过程，父亲和父亲节点比对 儿子和儿子节点比对
 */
setTimeout(() => {
  patch(oldVNode, newVNode);
}, 2000);

export default Vue;
