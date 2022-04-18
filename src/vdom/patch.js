/**
 * vue的核心流程：
 * 1. 创造响应式数据
 * 2. 模板编译 生成 ast
 * 3. ast 转为render函数 后续每次数据更新 只执行render函数(不需要再次进行ast的转换)
 * 4. render函数执行 生成 vNode节点（会使用到响应式数据）
 * 5. 根据vNode 生成 真实dom 渲染页面
 * 6. 数据更新 重新执行render
 */

import { isSameVNode } from ".";

/**
 * 更新 | 初渲染时 第一个节点的值是真实元素
 * @param {*} oldVNode 旧vnode
 * @param {*} vnode 最新的vnode
 */
function patch(oldVNode, vnode) {
  // 组件的挂载 vm.$el 对应的就是组件的渲染结果了
  if (!oldVNode) return createEle(vnode);

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
  // ------------------- 更新节点 --------------------
  return patchVnode(oldVNode, vnode); // 返回更新后的 dom元素
}
/**
 * 直接将新节点替换老节点，很消耗性能
 * 所以我们不直接替换，而是在比较两个节点之间的区别之后在替换，这就是diff算法
 * diff算是 是一个平级比较的过程，父亲和父亲节点比对 儿子和儿子节点比对
 */
function patchVnode(oldVNode, vnode) {
  /**
   * 1. 两个节点不是同一个节点，直接删除老的换上新的（不在继续对比属性等）
   * 2. 两个节点是同一个节点（tag，key都一致），比较两个节点的属性是否有差异
   * 复用老节点，将差异的属性更新
   */
  const el = oldVNode.el;
  // 不是同一个节点
  if (!isSameVNode(oldVNode, vnode)) {
    // tag && key
    // 直接替换
    const newEl = createEle(vnode);
    replaceChild(el.parentNode, newEl, el);
    return newEl;
  }
  // 文本的情况 文本我们期望比较一下文本的内容
  vnode.el = el;
  if (!oldVNode.tag) {
    if (oldVNode.text !== vnode.text) {
      textContent(el, vnode.text);
    }
  }
  // 是标签 我们需要比对标签的属性
  patchProps(el, oldVNode.props, vnode.props);
  // 有子节点
  /**
   * 1.旧节点有子节点 新节点没有
   * 2. 都有子节点
   * 3. 旧节点没有子节点，新节点有
   */
  const oldChildren = oldVNode.children || [];
  const newChildren = vnode.children || [];
  const oldLen = oldChildren.length,
    newLen = newChildren.length;
  if (oldLen && newLen) {
    // 完整的diff 都有子节点
    updateChildren(el, oldChildren, newChildren);
  } else if (newLen) {
    // 只有新节点有子节点 挂载
    mountChildren(el, newChildren);
  } else if (oldLen) {
    // 只有旧节点有子节点 全部卸载
    unmountChildren(el, oldChildren);
  }
  return el;
}
/**
 * 对比更新子节点
 * @param {*} el
 * @param {*} oldChildren
 * @param {*} newChildren
 */
// TODO 对于出现重复的key，有bug，还未修复。。。。
function updateChildren(el, oldChildren, newChildren) {
  // 我们为了比较两个儿子的时候，提高比较的性能（速度）
  /**
   * 1. 我们操作列表 经常会有 push pop shift unshift sort reverse 等方法 针对这些情况可以做一些优化
   * 2. vue2中采用双指针的方法 比较两个节点
   */
  let oldStartIndex = 0,
    oldEndIndex = oldChildren.length - 1,
    newStartIndex = 0,
    newEndIndex = newChildren.length - 1,
    oldStartVnode = oldChildren[oldStartIndex],
    oldEndVnode = oldChildren[oldEndIndex],
    newStartVnode = newChildren[newStartIndex],
    newEndVnode = newChildren[newEndIndex];
  // 乱序比较时 使用的映射表 {key:"节点在数组中的索引"} -> {a:0,b:1,...}
  const map = makeIndexByKey(oldChildren);
  // 循环比较 只要头指针不超过尾指针 就一直比较
  while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    // 排除 undefined 的情况
    if (!oldStartVnode) oldStartVnode = oldChildren[++oldStartIndex];
    if (!oldEndVnode) oldEndVnode = oldChildren[--oldStartIndex];
    /**
     * 1. old head -> new head
     * 2. old tail -> new tail
     * 3. old head -> new tail
     * 4. old tail -> new head
     * 5. 前面都不符合的情况下，进行乱序比较 看当前节点是否出现在老节点上
     */
    // 进行节点比较
    else if (isSameVNode(oldStartVnode, newStartVnode)) {
      // 头结点相同
      // 从头指针开始比较两个节点
      // 相同节点 递归比较子节点
      patchVnode(oldStartVnode, newStartVnode);
      oldStartVnode = oldChildren[++oldStartIndex];
      newStartVnode = newChildren[++newStartIndex];
    } else if (isSameVNode(oldEndVnode, newEndVnode)) {
      // 尾节点相同
      // 从尾指针开始比较两个节点
      patchVnode(oldEndVnode, newEndVnode);
      oldEndVnode = oldChildren[--oldEndIndex];
      newEndVnode = newChildren[--newEndIndex];
    }
    // 交叉比对 两次头尾比较
    //  a b c -> c a b 把尾节点移动到头结点之前
    else if (isSameVNode(oldEndVnode, newStartVnode)) {
      patchVnode(oldEndVnode, newStartVnode);
      console.log(oldEndVnode, newStartVnode);
      // 将老节点的尾节点插入到老节点头结点（头结点会变化）的前面去
      insertBefore(el, oldEndVnode.el, oldStartVnode.el);
      oldEndVnode = oldChildren[--oldEndIndex];
      newStartVnode = newChildren[++newStartIndex];
    }
    // a b c d -> d c b a 头结点移动到尾节点后面
    else if (isSameVNode(oldStartVnode, newEndVnode)) {
      patchVnode(oldStartVnode, newEndVnode);
      insertBefore(el, oldStartVnode.el, oldEndVnode.el.nextSibling);
      oldStartVnode = oldChildren[++oldStartIndex];
      newEndVnode = newChildren[--newEndIndex];
    } else {
      // 乱序比对 a b c ->  d e a b f
      /**
       * 根据老的列表做一个映射关系，用新的去找，找到则移动节点，找不到就新增节点，最后移除多余节点
       */
      // 如有值：则是需要移动的节点的索引
      let moveIndex = map[newStartVnode.key];
      if (moveIndex !== undefined) {
        const moveVnode = oldChildren[moveIndex];
        // 移动节点到头指针所在节点的前面
        insertBefore(el, moveVnode, oldStartVnode.el);
        // 标识这个节点已经移动过
        oldChildren[moveIndex] = undefined;
        patchVnode(moveVnode, newStartVnode);
      } else {
        // 找不到 这是新节点 创建 然后插入进去 完事
        insertBefore(el, createEle(newStartVnode), oldStartVnode.el);
      }
      newStartVnode = newChildren[++newStartIndex];
    }
  }
  // 新节点的比旧节点多 挂载
  if (newStartIndex <= newEndIndex) {
    for (let i = newStartIndex; i <= newEndIndex; i++) {
      // 这里可能是向后追加 也可能是向前插入
      // 判断当前的虚拟dom后面是否还有节点 有节点则是插入到该节点前面
      const anchor = newChildren[newEndIndex + 1]?.el;
      // 注意：插入方法在 要插入的那个节点不存在的情况下，自动变为追加方法 appendChild
      insertBefore(el, createEle(newChildren[i]), anchor);
    }
  }
  // 旧节点比新节点多 卸载
  if (oldStartIndex <= oldEndIndex) {
    for (let i = oldStartIndex; i <= oldEndIndex; i++) {
      // 乱序比对时 可能已经标记为 undefined了
      oldChildren[i] && removeChild(el, oldChildren[i].el);
    }
  }
}
/**
 * 生成映射表
 * @param {*} children
 * @returns
 */
function makeIndexByKey(children) {
  const map = {};
  children.forEach((child, index) => (map[child.key] = index));
  return map;
}

/**
 * 卸载dom
 * @param {*} el
 * @param {*} children
 */
// TODO 不要直接使用innerHTML清空
function unmountChildren(el, children) {
  children.forEach((child) => removeChild(el, child.el));
}

/**
 * 把子节点都变成真实dom 挂载到el上
 * @param {*} el
 * @param {*} children
 */
function mountChildren(el, children) {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    appendChild(el, createEle(child));
  }
}

function createEle(vnode) {
  const { tag, props, children, text } = vnode;
  if (typeof tag === "string") {
    // 区分真实节点和组件节点
    if (createComponent(vnode)) {
      return vnode.componentInstance.$el;
    }
    // 标签 div h2
    // 将虚拟节点和真实节点想管理 根据虚拟节点可以找到真实节点 方便修改属性
    vnode.el = createElement(tag);
    // 更新属性
    patchProps(vnode.el, {}, props);
    children.forEach((child) => {
      // 如果孩子是组件 会实例化组件 并且插入到父组件内部子节点的最后
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
 * @param {*} oldProps 老节点上的属性
 * @param {*} props
 */
function patchProps(el, oldProps, props) {
  // 老的属性中有的属性 新节点没有的 需要删除
  const oldStyle = oldProps?.style || {}; // oldProps 可能是null
  const newStyle = props?.style || {}; // props可能是null
  // 样式移除
  for (let key in oldStyle) {
    if (!newStyle[key]) {
      el.style[key] = "";
    }
  }
  // 属性移除
  for (const key in oldProps) {
    if (!props[key]) {
      removeAttribute(el, key);
    }
  }
  // 属性存在 则覆盖
  for (const key in props) {
    if (key === "style") {
      Object.keys(props[key]).forEach((k) => (el.style[k] = props["style"][k]));
    } else {
      setAttribute(el, key, props[key]);
    }
  }
}

function createComponent(vnode) {
  // init 初始化组件
  vnode.props?.hook?.init(vnode);
  return vnode.componentInstance;
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

function replaceChild(parent, child, oldChild, type = "browser") {
  switch (type.toLowerCase()) {
    case "browser":
      // document.insertBefore
      parent.replaceChild(child, oldChild);
      break;
  }
}

function removeAttribute(el, key, type = "browser") {
  switch (type.toLowerCase()) {
    case "browser":
      // document.insertBefore
      el.removeAttribute(key);
      break;
  }
}
/**
 * 修改元素的文本内容
 * @param {*} element
 * @param {*} text
 * @param {*} type
 */
function textContent(element, text, type = "browser") {
  switch (type.toLowerCase()) {
    case "browser":
      // document.insertBefore
      element.textContent = text;
      break;
  }
}

export {
  patch,
  createEle,
  patchProps,
  createElement,
  createTextNode,
  appendChild,
  setAttribute,
  removeChild,
  insertBefore,
};
