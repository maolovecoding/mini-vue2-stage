import { createElementVNode, createTextVNode } from "./vdom";

/*
 * @Author: 毛毛
 * @Date: 2022-04-14 14:10:39
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-14 20:42:46
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
  // 1.调用render 产生虚拟节点 vNode
  const vNodes = vm._render();
  // 2. 根据虚拟dom 产生真实dom
  vm._update(vNodes);
  // 3. 挂载到container上
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
        console.log(el);
        // patch 更新 + 初始化
        vm.$el = patch(el, vnode);
        console.log("_update----------------->", vnode);
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
/**
 * vue的核心流程：
 * 1. 创造响应式数据
 * 2. 模板编译 生成 ast
 * 3. ast 转为render函数 后续每次数据更新 只执行render函数(不需要再次进行ast的转换)
 * 4. render函数执行 生成 vNode节点（会使用到响应式数据）
 * 5. 根据vNode 生成 真实dom 渲染页面
 * 6. 数据更新 重新执行render
 */
/**
 * 更新 | 初渲染时 第一个节点的值是真实元素
 * @param {*} oldVNode 旧vnode
 * @param {*} vnode 最新的vnode
 */
function patch(oldVNode, vnode) {
  const isRealElement = oldVNode.nodeType;
  // 真实元素
  if (isRealElement) {
    const elm = oldVNode;
    // 获取父节点 1. 元素节点 2. 文档节点 3. 文档碎片节点
    const parentElm = elm.parentNode;
    // console.log(parentElm)
    const newEle = createEle(vnode);
    // 插入新dom 移除父节点上的老dom节点
    insertBefore(parentElm, newEle, elm.nextSibling);
    removeChild(parentElm, elm);
    // console.log(newEle)
    return newEle;
  }
}

function createEle(vnode) {
  const { tag, props, children, text } = vnode;
  if (typeof tag === "string") {
    // 标签 div h2
    // 将虚拟节点和真实节点想管理 根据虚拟节点可以找到真实节点 方便修改属性
    vnode.el = createElement(tag);
    // 更新属性
    patchProps(vnode.el, props);
    children.forEach((child) => {
      appendChild(vnode.el, createEle(child));
    });
  } else if (typeof tag === "object") {
    // 组件
  } else {
    // 创建文本节点
    vnode.el = createTextNode(text);
  }
  return vnode.el;
}
/**
 * 更新属性到dom节点上
 * @param {*} el
 * @param {*} props
 */
function patchProps(el, props) {
  for (const key in props) {
    if (key === "style") {
      Object.keys(props[key]).forEach((k) => (el.style[k] = props["style"][k]));
    } else {
      setAttribute(el, key, props[key]);
    }
  }
}

function createElement(tag, type = "browser") {
  switch (type.toLowerCase()) {
    case "browser":
      return document.createElement(tag);
  }
}

function createTextNode(tag, type = "browser") {
  switch (type.toLowerCase()) {
    case "browser":
      return document.createTextNode(tag);
  }
}

function appendChild(parent, child, type = "browser") {
  switch (type.toLowerCase()) {
    case "browser":
      parent.appendChild(child);
      break;
  }
}

function setAttribute(el, key, value, type = "browser") {
  switch (type.toLowerCase()) {
    case "browser":
      el.setAttribute(key, value);
      break;
  }
}

function removeChild(parent, child, type = "browser") {
  switch (type.toLowerCase()) {
    case "browser":
      parent.removeChild(child);
      break;
  }
}

function insertBefore(parent, child, prevChild, type = "browser") {
  switch (type.toLowerCase()) {
    case "browser":
      // document.insertBefore
      parent.insertBefore(child, prevChild);
      break;
  }
}
