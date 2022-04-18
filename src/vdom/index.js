/*
 * @Author: 毛毛
 * @Date: 2022-04-14 14:35:48
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-18 13:51:26
 * 虚拟dom 需要的方法
 */
const ReservedTags = [
  "div",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "span",
  "ul",
  "ol",
  "li",
  "a",
  "table",
  "button",
  "input",
];

const isReservedTag = (tag) => {
  return ReservedTags.includes(tag);
};
/**
 * 生成虚拟dom
 * 虚拟dom是和ast不一样的 -> ast是语法层面的转换，他描述的是语法本身（可以描述 js css html等等）
 * 我们的虚拟dom  是描述dom元素，可以增加自定义属性
 * @param {*} vm
 * @param {*} tag
 * @param {*} key
 * @param {*} props
 * @param {*} children
 * @param {*} text
 * @returns
 */
function vnode(vm, tag, key, props, children, text, componentOptions) {
  return {
    vm,
    tag,
    key,
    props, // props -> data
    children,
    text,
    // 组件的选项 包含组件的构造函数
    componentOptions,
  };
}
// h函数 创建元素节点
function createElementVNode(vm, tag, data = {}, ...children) {
  // if(data == null) data = {}
  const key = data?.key; // data可能是 null
  key && delete data.key;
  if (isReservedTag(tag)) return vnode(vm, tag, key, data, children);
  // 组件的虚拟节点 需要包含组件的构造函数等
  // 组件的构造函数 如果是局部组件 可能是一个对象 btn: {template:""}
  const CtorOrObj = vm.$options.components[tag];
  return createComponentVNode(vm, tag, key, data, children, CtorOrObj);
}
/**
 * 创建组件节点
 * @param {*} vm
 * @param {*} tag
 * @param {*} key
 * @param {*} data
 * @param {*} children
 * @param {*} CtorOrObj
 * @returns
 */
function createComponentVNode(vm, tag, key, data, children, CtorOrObj) {
  if (CtorOrObj != null && typeof CtorOrObj === "object") {
    // Vue.extend -> 变成构造函数
    CtorOrObj = vm.$options._base.extend(CtorOrObj);
  }
  // TODO 构造 组件的钩子 组件data是不能为null的
  data = data ?? {};
  data.hook = {
    // 创建真实节点的时候，如果是组件 则调用此init方法
    init(vnode) {
      // new Sub -> 保存实例到虚拟节点上
      const instance = (vnode.componentInstance =
        new vnode.componentOptions.Ctor());
      // instance.$el = 组件渲染的真实节点
      instance.$mount(); // 没有传递挂载的dom 最后会去 patch方法
      console.log(vnode.componentOptions.Ctor, "----------init");
    },
  };
  return vnode(vm, tag, key, data, children, null, { Ctor: CtorOrObj });
}

// _v 函数 创建文本节点
function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}
/**
 *
 * @param {*} n1
 * @param {*} n2
 * @returns {boolean} 是否是同一个vnode
 */
function isSameVNode(n1, n2) {
  return n1.tag === n2.tag && n1.key === n2.key;
}

export {
  createElementVNode,
  createTextVNode as h,
  createTextVNode,
  createTextVNode as _c,
  isSameVNode,
};
