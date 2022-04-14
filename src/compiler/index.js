/*
 * @Author: 毛毛
 * @Date: 2022-04-14 12:35:12
 * @Last Modified by: 毛毛
 * @Last Modified time: 2022-04-14 20:26:22
 * @Description 模板编译
 * 模板引擎实现原理： with + new Function
 */

import { parseHTML, defaultTagRE } from "./parser";
import { TEXT_TYPE, ELEMENT_TYPE } from "./type";
/**
 * 生成 render函数
 * @param {*} template 模板
 * @returns {Function}
 */
export function compileToFunction(template) {
  // console.log("compileToFunction-------------->" + template + "---------");
  // 1. template 转 ast
  const ast = parseHTML(template);
  console.log(ast);
  // 2. 生成render方法（该方法的执行结果是返回虚拟dom）
  // TODO 三个方法 _v文本节点 _s把变量转为字符串 _c元素节点
  // 2.1 生成render函数的返回代码块字符串形式
  const renderCodeBlock = codeGenerator(ast);
  // 2.2 生成render函数 new Function
  // 生成的代码中，取变量的值的时候，并没有去当前组件实例的上下文中取值
  // 而是直接 name age 所以这里绑定上下文（组件实例） name -> vm.name -> vm._data.name
  // this -> render.call(thisArg)
  const render = new Function(`with(this){\n return ${renderCodeBlock}}`);
  // console.log(render);
  return render;
}

/**
 * 根据ast生成代码
 * @param {{tag:string,children:Array,type:number,text:string,attrs:Array}} ast
 */
function codeGenerator(ast) {
  const children = generateChildren(ast.children);
  let code = `_c('${ast.tag}',${
    ast.attrs.length > 0 ? generateProps(ast.attrs) : "null"
  }${ast.children?.length ? `,${children}` : ""})`;
  return code;
}
/**
 * 生成属性对象 {name:"",id:"app"}
 * @param {Array<{name:string|symbol,value:any}>} attrs
 */
function generateProps(attrs) {
  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (attr.name === "style") {
      // style:"color:red;background-color:{{backgroundColor}}"
      // style:{color:"red","background-color":"{{backgroundColor}}"}
      let style = "";
      // const style = {};
      attr.value.split(";").forEach((item) => {
        if (!item.trim()) return;
        let [key, value] = item.split(":");
        let match = null;
        // defaultTagRE.lastIndex = 0;
        match = defaultTagRE.exec(value);
        if (match) {
          value = `_s(${match[1]})`;
        } else value = `'${value}'`;
        // style[key] = value;
        style += `'${key}':${value},`;
        console.log(style);
      });
      str += `${attr.name}:{${style.slice(0, -1)}},`;
    } else str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}
/**
 * 生成节点的子节点数组对象
 * @param {*} children
 */
function generateChildren(children) {
  if (children) {
    return children.map((child) => generateChild(child)).join(",");
  }
}
/**
 * 根据节点生成子字符串形式
 * @param {*} node
 * @returns
 */
function generateChild(node) {
  switch (node.type) {
    case ELEMENT_TYPE:
      // 元素节点
      // console.log(codeGenerator(node))
      return codeGenerator(node);
    case TEXT_TYPE:
      // console.log(node.text)
      // 文本节点
      const text = node.text;
      if (!defaultTagRE.test(text)) {
        // 纯文本节点 没有 {{xx}}
        return `_v(${JSON.stringify(text)})`;
      }
      // console.log(text);
      const tokens = [];
      // 匹配结果
      let match = null;
      defaultTagRE.lastIndex = 0;
      // 最后一次匹配结果的起始索引位置
      let lastIndex = 0;
      while ((match = defaultTagRE.exec(text))) {
        // console.log(match)
        // 当前匹配的到的起始位置
        let index = match.index;
        if (index > lastIndex)
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }
      // {{age}}--- 最后一次匹配后还有内容
      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }
      console.log(tokens);
      return `_v(${tokens.join("+")})`;
    default:
      return "";
  }
}
