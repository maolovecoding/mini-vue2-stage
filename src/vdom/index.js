/*
 * @Author: 毛毛
 * @Date: 2022-04-14 14:35:48
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-14 14:56:38
 * 虚拟dom 需要的方法
 */
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
function vnode(vm, tag, key, props, children, text) {
  return {
    vm,
    tag,
    key,
    props,
    children,
    text,
  };
}
// h函数 创建元素节点
function createElementVNode(vm, tag, data = {}, ...children) {
  const key = data?.key; // data可能是 null
  key && delete data.key;
  return vnode(vm, tag, key, data, children);
}
// _v 函数 创建文本节点
function createTextVNode(vm, text) {
  return vnode(vm, undefined, undefined, undefined, undefined, text);
}

export {
  createElementVNode,
  createTextVNode as h,
  createTextVNode,
  createTextVNode as _c,
};
