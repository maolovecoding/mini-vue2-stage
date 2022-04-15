# vue-study

## vue2的常见源码实现

### rollup环境搭建

#### 安装rollup及其插件

```shell
npm i rollup rollup-plugin-babel @babel/core @babel/preset-env rollup-plugin-node-resolve -D
```

#### 编写配置文件 rollup.config.js

这个可以直接使用es module

```js
// rollup默认可以导出一个对象 作为打包的配置文件
import babel from "rollup-plugin-babel";
import resolve from 'rollup-plugin-node-resolve'
export default {
  // 入口
  input: "./src/index.js",
  // 出口
  output: {
    // 生成的文件
    file: "./dist/vue.js",
    // 全局对象 Vue 在global(浏览器端就是window)上挂载一个属性 Vue
    name: "Vue",
    // 打包方式 esm commonjs模块 iife自执行函数 umd 统一模块规范 -> 兼容cmd和amd
    format: "umd",
    // 打包后和源代码做关联
    sourcemap: true,
  },
  plugins: [
    babel({
      // 排除第三方模块
      exclude: "node_modules/**",
    }),
    // 自动找文件夹下的index文件
    resolve()
  ],
};


```

##### babel.config.js

```js
// babel config
module.exports =  {
  // 预设
  presets: ["@babel/preset-env"],
};

```

#### 编写脚本

```json
"scripts": {
    "dev": "rollup -cw"
  }
```

-c表示使用配置文件，-w表示监控文件变化。

#### element.outerHTML

`outerHTML`属性获取描述元素（包括其后代）的序列化HTML片段。它也可以设置为用从给定字符串解析的节点替换元素。

```html
  <div id="app">
    <h2>{{name}}</h2>
    <span>{{age}}</span>
  </div>
  <script>
    console.log(document.querySelector("#app").outerHTML)
    /*
    <div id="app">
      <h2>{{name}}</h2>
      <span>{{age}}</span>
    </div>
  */
  </script>
```

## 核心流程

  **vue的核心流程：**

  1. 创造响应式数据
  2. 模板编译 生成 ast
  3. ast 转为render函数 后续每次数据更新 只执行render函数(不需要再次进行ast的转换)
  4. render函数执行 生成 vNode节点（会使用到响应式数据）
  5. 根据vNode 生成 真实dom 渲染页面
  6. 数据更新 重新执行render

## 数据劫持

**Vue2中使用的是Object.definedProperty**，**Vue3中直接使用Proxy了**

## 模板编译为ast

vue2中使用的是正则表达式进行匹配，然后转换为ast树。

模板引擎 性能差 需要正则匹配 替换 vue1.0 没有引入虚拟dom的改变，vue2 采用虚拟dom 数据变化后比较虚拟dom的差异 最后更新需要更新的地方， 核心就是我们需要将模板变成我们的js语法 通过js语法生成虚拟dom，语法之间的转换 需要先变成抽象语法树AST 再组装为新的语法，这里就是把template语法转为render函数。

### ast转render

把生成的ast语法树，通过字符串拼接等方式转为render函数。
render函数内部主要用到：

1. _c函数：创建元素虚拟dom节点
2. _v函数：创建文本虚拟dom节点
3. _s函数：将函数内的变量字符串化

### render函数生成真实dom

调用render函数，会生成虚拟dom，然后把虚拟dom转为真实DOM，挂载到页面即可。

## 回忆流程

**核心流程：**

1. 数据处理成响应式，在 initState中处理的（针对对象来说主要是definedProperty，数组则是重写七个方法）
2. 模板编译：先把模板转成ast语法树，再把语法树生成**render函数**
3. 调用render函数，可能会进行变量的取值操作(_s函数内有变量)，产生对应的虚拟dom
4. 虚拟dom渲染为真实dom，挂载到页面即可

**完成了，虚拟和真实dom的渲染，也完成了响应式数据的处理，接下来需要进行视图和响应式数据的关联，在渲染页面的时候，收集依赖数据。**

1. 使用观察者模式实现依赖收集
2. 异步更新策略
3. mixin的实现原理

### 模板的依赖收集

要完成依赖的收集，很明显的就是，我们要如何得知，此模板在此次渲染的时候，用到了那些响应式数据。

我们可以给模板中的属性，增加一个**收集器（dep）**。这个收集器，是给每个属性单独增加的。页面渲染的时候，我们把渲染逻辑封装到watcher中。（其实就是手动更新视图的那两个方法app._update(app._render())）。让dep记住这个watcher即可，在属性变化了以后，可以找到对应的dep中存放的watcher，然后执行重新渲染页面。

这里面我们用到的方式其实就是**观察者模式**。

```js
/**
 * watcher 进行实际的视图渲染
 * 每个组件都有自己的watcher，可以减少每次更新页面的部分
 * 给每个属性都增加一个dep，目的就是收集watcher
 * 一个视图（组件）可能有很多属性，多个属性对应一个视图 n个dep对应1个watcher
 * 一个属性也可能对应多个视图（组件）
 * 所以 dep 和 watcher 是多对多关系
 * 
 * 每个属性都有自己的dep，属性就是被观察者
 * watcher就是观察者（属性变化了会通知观察者进行视图更新）-> 观察者模式
 */
class Watcher{}
```

先让watcher收集dep，如果dep已经收集过，则不会再次收集。当dep被收集的时候，我们也会让dep反向收集当前的watcher。实现二者的双向收集。

然后在响应式数据发送改变的时候，通知dep的观察者（watcher）进行视图更新。

![image-20220415105750259](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220415105750259.png)

#### 视图同步渲染

此时，已经完成了响应式数据和视图的绑定，在数据发生改变的情况下，视图会同步更新。也就是说，我们更新了两次响应式数据，也会更新两次视图。

![image-20220415110028536](https://gitee.com/maolovecoding/picture/raw/master/images/web/webpack/image-20220415110028536.png)

正常情况下，更新两次视图是没有问题的，但是此时两次数据的更新发生在一次同步代码中，我们应该让视图的更新是异步的，这样在一次操作更新多个数据的情况下，也只会渲染一次视图，提高渲染速率。
