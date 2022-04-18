import { createElementVNode, createTextVNode } from "./vdom";
import { patch } from "./vdom/patch";
import Watcher from "./observe/watcher";
/*
 * @Author: 毛毛
 * @Date: 2022-04-14 14:10:39
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-18 14:02:59
 * 组件挂载 生命周期
 * vm._render() 生成虚拟节点 vNode
 * vm._update() 虚拟节点变成真实节点 dom
 */
export function mountComponent(vm, container) {
  // 记录需要挂载的容器 $el
  Object.defineProperty(vm, "$el", {
    value: container,
    writable: true,
  });
  // 这里把渲染逻辑封装到watcher中
  const updateComponent = () => {
    // 1.调用render 产生虚拟节点 vNode
    const vNodes = vm._render();
    // 2. 根据虚拟dom 产生真实dom
    vm._update(vNodes);
  };
  new Watcher(vm, updateComponent, true);
  // 3. 挂载到container上 _update中实现
}
/**
 * 扩展原型方法
 * @param {*} Vue
 */
export function initLifeCycle(Vue) {
  Object.defineProperties(Vue.prototype, {
    _render: {
      // 当渲染的时候，会去实例中取值，我们就可以将属性和视图绑定在一起
      value: function _render() {
        const vm = this;
        // 绑定 this为组件实例
        return vm.$options.render.call(vm);
      },
    },
    _update: {
      /**
       * 将虚拟dom转为真实dom  vnode -> dom
       * @param {*} vnode 虚拟dom节点
       */
      value: function _update(vnode) {
        const vm = this;
        // 挂载的容器 
        const el = vm.$el;
        // 拿到上次的vnode
        const prevVnode = vm._vnode;
        // 记录每次产生的 vnode
        vm._vnode = vnode;
        if (prevVnode) {
          // 更新
          vm.$el = patch(prevVnode, vnode);
        } else {
          // 初渲染
          // patch 更新 + 初始化 + 组件的创建（el为null）
          vm.$el = patch(el, vnode);
        }
        // console.log("_update----------------->", vnode);
      },
    },
    // _c("div",{name:'zs'},...children) 元素 虚拟dom
    _c: {
      value: function _c() {
        // this -> vm
        return createElementVNode(this, ...arguments);
      },
    },
    // _v(text) 文本虚拟dom
    _v: {
      value: function _v() {
        return createTextVNode(this, ...arguments);
      },
    },
    // 就是变量字符串化
    _s: {
      value: function _s(value) {
        // 对于不是对象的字符串，没必要再次转字符串了，不然会多出引号 zs -> \"zs\"
        return typeof value === "object" ? JSON.stringify(value) : value;
      },
    },
  });
}
