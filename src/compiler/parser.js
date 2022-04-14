/*
 * @Author: 毛毛
 * @Date: 2022-04-13 12:25:22
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-14 14:28:15
 * @Description 模板编译
 * 解析模板 可以使用现成的包 html-parser2
 */
import { ELEMENT_TYPE, TEXT_TYPE } from "./type";
/**
 * 匹配标签名
 * 开头不能包含特殊字符和数字
 * 第二个字符开始 可以是任意字符了 / \ 空白符 . 都可以
 *  div _div _ab88 a_9.//a
 *
 */
const ncname = "[a-zA-Z_][\\-\\.0-9a-zA-Z]*";
/**
 * 捕获 标签名
 * 注意 ?: 只匹配不捕获
 * 这里的匹配标签名 后面还有:的这种 是带命名空间的标签 比如 a:b
 */
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// ((?:[a-zA-Z_][\\-\\.0-9a-zA-Z]*\\:)?[a-zA-Z_][\\-\\.0-9a-zA-Z]*)
/**
 * 匹配到的分组是一个 标签名 <div
 */
// ^<((?:[a-zA-Z_][\\-\\.0-9a-zA-Z]*\\:)?[a-zA-Z_][\\-\\.0-9a-zA-Z]*)
const startTagOpen = new RegExp(`^<${qnameCapture}`);
/**
 * 匹配标签名结束 <\/div> 因为 /具有特殊含义
 */
// ^<\\/((?:[a-zA-Z_][\\-\\.0-9a-zA-Z]*\\:)?[a-zA-Z_][\\-\\.0-9a-zA-Z]*)[^>]*>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
// `^<\\/${qnameCapture}[^>]*>`
/**
 * 匹配属性  a="abc" a='abc' a=abc a
 * 分组一的值就是键key 分组3/4/5匹配到的是value
 */
const attribute =
  /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
/**
 * 匹配标签结束
 * 标签可能自闭合 <div></div> <br/>  />
 */
const startTagClose = /^\s*(\/?)>/;
/**
 * 匹配 双花括号语法 {{}} 匹配到的是就是双花括号的 变量
 */
export const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
/**
 * 解析 模板
 * @param {string} html 模板字符串
 * vue2采用正则编译解析 vue3不是采用正则了
 */
function parseHTML(html) {
  /**
   * 最终需要转换为一颗抽象语法树 ast abstract syntax tree
   * 可以借助栈思想
   * 栈中的最后一个标签元素 就是当前正在匹配的元素的父元素
   * @type {Array<{tag:string,type:number,children:Array}>}
   */
  const stack = [];
  // 栈帧 指向最后一个元素
  let curParent = null;
  let root = null; // 根元素

  /**
   * 创建 ast
   * @param {string} tag 标签名
   * @param {Array<{name:string,value:any}>} attrs 属性
   * @returns
   */
  function createASTElement(tag, attrs) {
    return {
      tag,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }
  /**
   * 处理开始标签 并且开始构造抽象语法树
   * @param {string} tag
   * @param {Array<{name:string,value:any}>} attrs
   * @param {boolean} isSelfClose 是否自闭合
   */
  function start(tag, attrs, isSelfClose) {
    // console.log(tag, attrs);
    // 当前节点
    const node = createASTElement(tag, attrs);
    // 根节点
    root = root ?? node;
    // 更新当前节点的父节点 更新父元素的子元素节点
    curParent && ((node.parent = curParent), curParent.children.push(node));
    // TODO 是自闭合标签 不需要入栈的
    if (isSelfClose) return;
    // 新节点入栈
    stack.push(node);
    // 更新当前指向的最前面的父节点
    curParent = node;
    // console.log(node, root);
  }
  /**
   * 处理文本内容
   * @param {string} text
   */
  function chars(text) {
    // 去除空字符串
    text = text.replace(/^\s+|\s+$/gm, "");
    // console.log(text);
    // 文本节点 插入到父元素的孩子中
    text &&
      curParent.children.push({
        type: TEXT_TYPE,
        text,
        parent: curParent,
      });
  }
  /**
   * 处理结束标签
   * @param {string} tag 标签名称
   */
  function end(tag) {
    // console.log(tag);
    // 弹出最后一个栈元素 并更新指向的父节点
    const node = stack.pop();
    // TODO 可以根据tag和node.tag 校验标签是否合法等 也需要考虑自闭合标签
    if (tag !== node.tag) {
      // console.log("标签不合法---------",tag, node);
    }
    curParent = stack[stack.length - 1];
  }
  /**
   * 解析模板的开始标签
   * @param {string} html 模板字符串
   */
  function parseStartTag() {
    // 匹配标签起始位置
    const start = html.match(startTagOpen);
    if (start) {
      // 是开始标签
      const match = {
        // 标签名
        tagName: start[1],
        // 属性
        attrs: [],
        // 是否是自闭合标签
        isSelfClose: false,
      };
      advance(start[0].length);
      // 不是标签结束位置 一直匹配
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        // 去除属性
        advance(attr[0].length);
        match.attrs.push({
          // 属性名
          name: attr[1],
          // 属性值 key="value" key='value' key=value
          // key  对于只有key的这种，我们给默认值true
          value: attr[3] || attr[4] || attr[5] || true,
        });
      }
      // 去除标签的右闭合箭头  <div> 中的 > 或者自闭合标签 <br/> />
      if (end) {
        advance(end[0].length);
        // 自闭合
        if (end[0].endsWith("/>")) match.isSelfClose = true;
      }
      // console.log(match);
      return match;
    }
    // 不是开始标签
    return false;
  }
  /**
   * 字符串截取
   * @param {number} start 截取的起始位置
   */
  function advance(start) {
    html = html.substring(start);
  }
  // vue2中 html 开头肯定是 <  <div>hello</div>
  while (html) {
    // 如果indexOf中索引的值是 0 则说明是个开始标签 或者 结束标签
    // > 0 是文本的结束位置  </div>
    let textEnd = html.indexOf("<");
    if (textEnd === 0) {
      // 解析开始标签 开始标签及其标签内的属性等
      const startTagMatch = parseStartTag(); // 匹配结果
      if (startTagMatch) {
        // console.log(startTagMatch);
        start(
          startTagMatch.tagName,
          startTagMatch.attrs,
          startTagMatch.isSelfClose
        );
        continue;
      }
      // 去除结束标签 来到这里 肯定是 </xxx>
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        // console.log(endTagMatch, html);
        end(endTagMatch[1]);
        continue;
      }
    }
    // 文本内容  adb<h2></h2>
    if (textEnd > 0) {
      // 获取文本内容
      const text = html.substring(0, textEnd);
      if (text) {
        advance(text.length); // 解析到的文本
        chars(text);
      }
      // console.log(html);
    }
  }
  // console.log(root);
  // 返回 生成的vNode树 ast
  return root;
}

export { parseHTML };
