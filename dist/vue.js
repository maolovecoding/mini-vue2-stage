(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) return _arrayLikeToArray(arr);
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  /*
   * @Author: 毛毛 
   * @Date: 2022-04-15 20:52:34 
   * @Last Modified by:   毛毛 
   * @Last Modified time: 2022-04-15 20:52:34 
   * 导出mixin时用到的一些策略模式
   */
  // 策略模式
  var strategy = {}; // 生命周期

  var LIFE_CYCLE = ["beforeCreate", "created", "beforeMount", "mounted", "beforeUpdate", "update"];
  LIFE_CYCLE.forEach(function (hook) {
    strategy[hook] = function (s1, s2) {
      if (s2) {
        if (s1) {
          // 合并选项
          // return s1.concat(s2);
          return [].concat(_toConsumableArray(s1), [s2]);
        } else {
          // 全局options没有 用户传递的有 变成数组
          return [s2];
        }
      } else {
        return s1;
      }
    };
  });

  /*
   * @Author: 毛毛
   * @Date: 2022-04-15 20:43:57
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-15 21:37:02
   * 合并对象的方法
   */
  function mergeOptions() {
    var opts = {};

    for (var _len = arguments.length, options = new Array(_len), _key = 0; _key < _len; _key++) {
      options[_key] = arguments[_key];
    }

    var source1 = options[0],
        source2 = options[1];

    for (var key in source1) {
      mergeField(key);
    }

    for (var _key2 in source2) {
      if (!source1.hasOwnProperty(_key2)) {
        mergeField(_key2);
      }
    }

    function mergeField(key) {
      // 策略模式 减少 if / else
      if (strategy[key]) {
        opts[key] = strategy[key](source1[key], source2[key]);
      } // 优先采用用户的选项 再采用全局已存在的
      else opts[key] = source2[key] === void 0 ? source1[key] : source2[key];
    }

    if (options.length > 2) {
      options.splice(0, 2);
      return mergeOptions.apply(void 0, [opts].concat(options));
    }

    return opts;
  }

  /*
   * @Author: 毛毛
   * @Date: 2022-04-15 20:40:36
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-15 20:51:17
   * 全局静态 api
   */

  function initGlobalStaticAPI(Vue) {
    Vue.options = {}; // 全局选项
    // 混入

    Vue.mixin = function mixin(mixin) {
      // 我们期望将用户的选项和全局的options进行合并
      // {} + mixin {created(){}} => {created:[fn]}
      this.options = mergeOptions(Vue.options, mixin); // console.log(this.options);

      return this;
    };
  }

  /**
   * 是否是函数
   * @param {*} source 对象
   * @returns
   */
  function isFunction(source) {
    return typeof source === "function";
  }
  var isObject = function isObject(source) {
    return source != null && _typeof(source) === "object";
  };

  /*
   * @Author: 毛毛
   * @Date: 2022-04-13 10:02:33
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-13 10:26:05
   * @Description 重写数组中的变异方法
   */
  var oldArrayProto = Array.prototype;
  var newArrayProto = Object.create(oldArrayProto);
  /**
   * 七个变异方法 会改变数组本身的方法
   * @type {Array<string>}
   */

  var methods = ["push", "pop", "unshift", "shift", "reverse", "sort", "splice"];
  methods.forEach(function (method) {
    // 重写数组的方法 内部调用的还是原来的方法
    // 函数的劫持 切片编程
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      // 如果新增的数组元素是对象 需要再次劫持
      var inserted; // Observe实例

      var ob = this.__ob__;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      switch (method) {
        case "push":
        case "unshift":
          // 插入元素
          // 新增的元素 可能是对象
          inserted = args;
          break;

        case "splice":
          // 数组最强方法 splice(start, delCount, ...新增元素)
          inserted = args.slice(2); // 新增的元素

          break;
      }

      console.log("新增的内容------------------>", inserted);

      if (inserted) {
        // 观测新增的内容
        ob.observeArray(inserted);
      }

      console.log("\u91CD\u5199\u7684".concat(method, "\u65B9\u6CD5\u88AB\u8C03\u7528------> this = "), this);

      var res = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args));

      return res;
    };
  });

  /*
   * @Author: 毛毛
   * @Date: 2022-04-15 09:31:54
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-15 21:15:14
   * 依赖收集 dep
   */
  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      _defineProperty(this, "id", id$1++);

      // 属性的dep要收集watcher
      this.subs = [];
    }
    /**
     * 收集当前属性 对应的视图 watcher
     */


    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 这里我们不希望收集重复的watcher，而且现在还只是单向的关系 dep -> watcher
        // watcher 也需要记录 dep
        // this.subs.push(Dep.target);
        // console.log(this.subs);
        // 这里是让watcher先记住dep
        Dep.target.addDep(this); //  this -> dep
      }
      /**
       * dep 在反过来记录watcher
       * @param {*} watcher
       */

    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher); // console.log(watcher);
      }
      /**
       * 更新视图
       */

    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      } // 当前的watcher

    }]);

    return Dep;
  }();

  _defineProperty(Dep, "target", null);

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      // 记录this 也是一个标识 如果对象上有了该属性 标识已经被观测
      Object.defineProperty(data, "__ob__", {
        value: this // observe的实例

      }); // 如果劫持的数据是数组

      if (Array.isArray(data)) {
        // 重写数组上的7个方法 这7个变异方法是可以修改数组本身的
        Object.setPrototypeOf(data, newArrayProto); // 对于数组元素是 引用类型的，需要深度观测的

        this.observeArray(data);
      } else {
        // Object.defineProperty 只能劫持已经存在的属性（vue提供单独的api $set $delete 为了增加新的响应式属性）
        this.walk(data);
      }
    }
    /**
     * 循环对象 对属性依次劫持 重新‘定义’属性
     * @param {*} data
     */


    _createClass(Observe, [{
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
      /**
       * 劫持数组元素 是普通原始值不会劫持
       * @param {Array} data
       */

    }, {
      key: "observeArray",
      value: function observeArray(data) {
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observe;
  }();
  /**
   * 定义目标对象上的属性为响应式
   * @param {Object} obj
   * @param {string|symbol} key
   * @param {*} value
   */


  function defineReactive(obj, key, value) {
    // 如果属性也是对象 再次劫持
    observe(value); // 每个属性都有一个dep

    var dep = new Dep();
    Object.defineProperty(obj, key, {
      get: function get() {
        // 判断 Dep.target
        if (Dep.target) {
          // 当前属性 记住这个watcher 也就是视图依赖的收集
          dep.depend();
        }

        return value;
      },
      set: function set(newVal) {
        if (newVal === value) return; // 新值是对象 则需要重新观测

        observe(newVal);
        value = newVal; // 更新数据 通知视图更新

        dep.notify();
      }
    });
  }
  /**
   * 数据劫持方法
   * @param {*} data 需要劫持的数据
   */

  function observe(data) {
    // 不是对象 不需要劫持
    if (!isObject(data)) return; // 如果一个对象被劫持过了，那么不需要再次被劫持了

    if (data.__ob__ instanceof Observe) return data.__ob__; // console.log("observe---------------->", data);

    return new Observe(data);
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      enumerable: true,
      get: function get() {
        return vm[target][key];
      },
      set: function set(newVal) {
        vm[target][key] = newVal;
      }
    });
  }
  /**
   * 初始化实例
   * @param {*} vm vue实例
   */


  function initState(vm) {
    var opts = vm.$options; // 获取所有选项

    if (opts.data) {
      // data 初始化
      initData(vm);
    }
  }
  /**
   * 初始化 data
   * @param {*} vm 实例
   */


  function initData(vm) {
    // data可能是函数 也可能是对象
    var data = vm.$options.data; // data是函数 执行一下

    if (isFunction(data)) data = data.call(vm);
    Object.defineProperty(vm, "_data", {
      configurable: true,
      // enumerable: false,
      writable: true,
      value: data
    });
    console.log("initData------------>", data); // 数据劫持

    observe(data); // 把 vm._data 用vm来代理 访问 vm.name -> vm._data.name

    for (var key in data) {
      proxy(vm, "_data", key);
    }
  }

  /*
   * @Author: 毛毛 
   * @Date: 2022-04-14 13:09:23 
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-14 13:10:07
   * 节点类型
   */
  // 元素类型
  var ELEMENT_TYPE = 1; // 文本类型

  var TEXT_TYPE = 3;

  /*
   * @Author: 毛毛
   * @Date: 2022-04-13 12:25:22
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-14 14:28:15
   * @Description 模板编译
   * 解析模板 可以使用现成的包 html-parser2
   */
  /**
   * 匹配标签名
   * 开头不能包含特殊字符和数字
   * 第二个字符开始 可以是任意字符了 / \ 空白符 . 都可以
   *  div _div _ab88 a_9.//a
   *
   */

  var ncname = "[a-zA-Z_][\\-\\.0-9a-zA-Z]*";
  /**
   * 捕获 标签名
   * 注意 ?: 只匹配不捕获
   * 这里的匹配标签名 后面还有:的这种 是带命名空间的标签 比如 a:b
   */

  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); // ((?:[a-zA-Z_][\\-\\.0-9a-zA-Z]*\\:)?[a-zA-Z_][\\-\\.0-9a-zA-Z]*)

  /**
   * 匹配到的分组是一个 标签名 <div
   */
  // ^<((?:[a-zA-Z_][\\-\\.0-9a-zA-Z]*\\:)?[a-zA-Z_][\\-\\.0-9a-zA-Z]*)

  var startTagOpen = new RegExp("^<".concat(qnameCapture));
  /**
   * 匹配标签名结束 <\/div> 因为 /具有特殊含义
   */
  // ^<\\/((?:[a-zA-Z_][\\-\\.0-9a-zA-Z]*\\:)?[a-zA-Z_][\\-\\.0-9a-zA-Z]*)[^>]*>

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // `^<\\/${qnameCapture}[^>]*>`

  /**
   * 匹配属性  a="abc" a='abc' a=abc a
   * 分组一的值就是键key 分组3/4/5匹配到的是value
   */

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  /**
   * 匹配标签结束
   * 标签可能自闭合 <div></div> <br/>  />
   */

  var startTagClose = /^\s*(\/?)>/;
  /**
   * 匹配 双花括号语法 {{}} 匹配到的是就是双花括号的 变量
   */

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
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
    var stack = []; // 栈帧 指向最后一个元素

    var curParent = null;
    var root = null; // 根元素

    /**
     * 创建 ast
     * @param {string} tag 标签名
     * @param {Array<{name:string,value:any}>} attrs 属性
     * @returns
     */

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }
    /**
     * 处理开始标签 并且开始构造抽象语法树
     * @param {string} tag
     * @param {Array<{name:string,value:any}>} attrs
     * @param {boolean} isSelfClose 是否自闭合
     */


    function start(tag, attrs, isSelfClose) {
      var _root;

      // console.log(tag, attrs);
      // 当前节点
      var node = createASTElement(tag, attrs); // 根节点

      root = (_root = root) !== null && _root !== void 0 ? _root : node; // 更新当前节点的父节点 更新父元素的子元素节点

      curParent && (node.parent = curParent, curParent.children.push(node)); // TODO 是自闭合标签 不需要入栈的

      if (isSelfClose) return; // 新节点入栈

      stack.push(node); // 更新当前指向的最前面的父节点

      curParent = node; // console.log(node, root);
    }
    /**
     * 处理文本内容
     * @param {string} text
     */


    function chars(text) {
      // 去除空字符串
      text = text.replace(/^\s+|\s+$/gm, ""); // console.log(text);
      // 文本节点 插入到父元素的孩子中

      text && curParent.children.push({
        type: TEXT_TYPE,
        text: text,
        parent: curParent
      });
    }
    /**
     * 处理结束标签
     * @param {string} tag 标签名称
     */


    function end(tag) {
      // console.log(tag);
      // 弹出最后一个栈元素 并更新指向的父节点
      var node = stack.pop(); // TODO 可以根据tag和node.tag 校验标签是否合法等 也需要考虑自闭合标签

      if (tag !== node.tag) ;

      curParent = stack[stack.length - 1];
    }
    /**
     * 解析模板的开始标签
     * @param {string} html 模板字符串
     */


    function parseStartTag() {
      // 匹配标签起始位置
      var start = html.match(startTagOpen);

      if (start) {
        // 是开始标签
        var match = {
          // 标签名
          tagName: start[1],
          // 属性
          attrs: [],
          // 是否是自闭合标签
          isSelfClose: false
        };
        advance(start[0].length); // 不是标签结束位置 一直匹配

        var attr, _end;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // 去除属性
          advance(attr[0].length);
          match.attrs.push({
            // 属性名
            name: attr[1],
            // 属性值 key="value" key='value' key=value
            // key  对于只有key的这种，我们给默认值true
            value: attr[3] || attr[4] || attr[5] || true
          });
        } // 去除标签的右闭合箭头  <div> 中的 > 或者自闭合标签 <br/> />


        if (_end) {
          advance(_end[0].length); // 自闭合

          if (_end[0].endsWith("/>")) match.isSelfClose = true;
        } // console.log(match);


        return match;
      } // 不是开始标签


      return false;
    }
    /**
     * 字符串截取
     * @param {number} start 截取的起始位置
     */


    function advance(start) {
      html = html.substring(start);
    } // vue2中 html 开头肯定是 <  <div>hello</div>


    while (html) {
      // 如果indexOf中索引的值是 0 则说明是个开始标签 或者 结束标签
      // > 0 是文本的结束位置  </div>
      var textEnd = html.indexOf("<");

      if (textEnd === 0) {
        // 解析开始标签 开始标签及其标签内的属性等
        var startTagMatch = parseStartTag(); // 匹配结果

        if (startTagMatch) {
          // console.log(startTagMatch);
          start(startTagMatch.tagName, startTagMatch.attrs, startTagMatch.isSelfClose);
          continue;
        } // 去除结束标签 来到这里 肯定是 </xxx>


        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length); // console.log(endTagMatch, html);

          end(endTagMatch[1]);
          continue;
        }
      } // 文本内容  adb<h2></h2>


      if (textEnd > 0) {
        // 获取文本内容
        var text = html.substring(0, textEnd);

        if (text) {
          advance(text.length); // 解析到的文本

          chars(text);
        } // console.log(html);

      }
    } // console.log(root);
    // 返回 生成的vNode树 ast


    return root;
  }

  /**
   * 生成 render函数
   * @param {*} template 模板
   * @returns {Function}
   */

  function compileToFunction(template) {
    // console.log("compileToFunction-------------->" + template + "---------");
    // 1. template 转 ast
    var ast = parseHTML(template); // console.log(ast);
    // 2. 生成render方法（该方法的执行结果是返回虚拟dom）
    // TODO 三个方法 _v文本节点 _s把变量转为字符串 _c元素节点
    // 2.1 生成render函数的返回代码块字符串形式

    var renderCodeBlock = codeGenerator(ast); // 2.2 生成render函数 new Function
    // 生成的代码中，取变量的值的时候，并没有去当前组件实例的上下文中取值
    // 而是直接 name age 所以这里绑定上下文（组件实例） name -> vm.name -> vm._data.name
    // this -> render.call(thisArg)

    var render = new Function("with(this){\n return ".concat(renderCodeBlock, "}")); // console.log(render);

    return render;
  }
  /**
   * 根据ast生成代码
   * @param {{tag:string,children:Array,type:number,text:string,attrs:Array}} ast
   */

  function codeGenerator(ast) {
    var _ast$children;

    var children = generateChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? generateProps(ast.attrs) : "null").concat((_ast$children = ast.children) !== null && _ast$children !== void 0 && _ast$children.length ? ",".concat(children) : "", ")");
    return code;
  }
  /**
   * 生成属性对象 {name:"",id:"app"}
   * @param {Array<{name:string|symbol,value:any}>} attrs
   */


  function generateProps(attrs) {
    var str = "";

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === "style") {
        // style:"color:red;background-color:{{backgroundColor}}"
        // style:{color:"red","background-color":"{{backgroundColor}}"}
        var style = ""; // const style = {};

        attr.value.split(";").forEach(function (item) {
          if (!item.trim()) return;

          var _item$split = item.split(":"),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];

          var match = null; // defaultTagRE.lastIndex = 0;

          match = defaultTagRE.exec(value);

          if (match) {
            value = "_s(".concat(match[1], ")");
          } else value = "'".concat(value, "'"); // style[key] = value;


          style += "'".concat(key, "':").concat(value, ","); // console.log(style);
        });
        str += "".concat(attr.name, ":{").concat(style.slice(0, -1), "},");
      } else str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }
  /**
   * 生成节点的子节点数组对象
   * @param {*} children
   */


  function generateChildren(children) {
    if (children) {
      return children.map(function (child) {
        return generateChild(child);
      }).join(",");
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
        var text = node.text;

        if (!defaultTagRE.test(text)) {
          // 纯文本节点 没有 {{xx}}
          return "_v(".concat(JSON.stringify(text), ")");
        } // console.log(text);


        var tokens = []; // 匹配结果

        var match = null;
        defaultTagRE.lastIndex = 0; // 最后一次匹配结果的起始索引位置

        var lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          // console.log(match)
          // 当前匹配的到的起始位置
          var index = match.index;
          if (index > lastIndex) tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        } // {{age}}--- 最后一次匹配后还有内容


        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        } // console.log(tokens);


        return "_v(".concat(tokens.join("+"), ")");

      default:
        return "";
    }
  }

  /*
   * @Author: 毛毛
   * @Date: 2022-04-14 14:35:48
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-15 08:45:32
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
      vm: vm,
      tag: tag,
      key: key,
      props: props,
      children: children,
      text: text
    };
  } // h函数 创建元素节点


  function createElementVNode(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var key = data === null || data === void 0 ? void 0 : data.key; // data可能是 null

    key && delete data.key;

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  } // _v 函数 创建文本节点


  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  /*
   * @Author: 毛毛
   * @Date: 2022-04-15 09:09:45
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-15 14:54:49
   * 封装视图的渲染逻辑 watcher
   */

  var id = 0;
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

  var Watcher = /*#__PURE__*/function () {
    // 目前只有一个watcher实例 因为我只有一个实例 根组件

    /**
     *
     * @param {*} vm 组件实例
     * @param {*} updateComponent 渲染页面的回调函数
     * @param {boolean} options 是否是初渲染
     */
    function Watcher(vm, updateComponent, options) {
      _classCallCheck(this, Watcher);

      _defineProperty(this, "id", id++);

      this.renderWatcher = options; // 调用这个函数 意味着可以发生取值操作

      this.getter = updateComponent; // 收集 dep   watcher -> deps

      this.deps = []; // 在组件卸载的时候，清理响应式数据使用 还有实现响应式数据等都需要使用到

      this.depsId = new Set(); // dep id
      // 初渲染

      this.get();
    }

    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        /**
         * 1.当我们创建渲染watcher的时候 会把当前的渲染watcher放到Dep.target上
         * 2.调用_render()取值 走到值的get上
         */
        Dep.target = this; // 去 vm上取值

        this.getter(); // 渲染完毕后清空

        Dep.target = null;
      }
      /**
       * 一个组件对应多个属性 但是重复的属性 也不需要记录
       * 比如在组件视图中 用到了多次的name属性，那么需要记录每次用到name的watcher吗
       * @param {*} dep
       */

    }, {
      key: "addDep",
      value: function addDep(dep) {
        // dep去重 可以用到 dep.id
        var id = dep.id;

        if (!this.depsId.has(id)) {
          // watcher记录dep
          this.deps.push(dep);
          this.depsId.add(id); // dep记录watcher

          dep.addSub(this);
        }
      }
      /**
       * 更新视图 本质重新执行 render函数
       */

    }, {
      key: "update",
      value: function update() {
        // 同步更新视图 改为异步更新视图
        // this.get();
        // 把当前的watcher暂存
        queueWatcher(this);
        console.log("update watcher.................");
      }
      /**
       * 实际刷新视图的操作 执行render用到的都是实例最新的属性值
       */

    }, {
      key: "run",
      value: function run() {
        console.log("run------------------");
        this.get();
      }
    }]);

    return Watcher;
  }(); // watcher queue 本次需要更新的视图队列


  var queue = []; // watcher 去重  {0:true,1:true}

  var has = {}; // 批处理 也可以说是防抖

  var pending = false;
  /**
   * 不管执行多少次update操作，但是我们最终只执行一轮刷新操作
   * @param {*} watcher
   */

  function queueWatcher(watcher) {
    var id = watcher.id; // 去重

    if (!has[id]) {
      queue.push(watcher);
      has[id] = true;
      console.log(queue);

      if (!pending) {
        // 刷新队列 多个属性刷新 其实执行的只是第一次 合并刷新了
        // setTimeout(flushSchedulerQueue, 0);
        // 将刷新队列的执行和用户回调的执行都放到一个微任务中
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }
  /**
   * 刷新调度队列 且清理当前的标识 has pending 等都重置
   * 先执行第一批的watcher，如果刷新过程中有新的watcher产生，再次加入队列即可
   */


  function flushSchedulerQueue() {
    var flushQueue = _toConsumableArray(queue);

    queue = [];
    has = {};
    pending = false; // 刷新视图 如果在刷新过程中 还有新的watcher 会重新放到queueWatcher中

    flushQueue.forEach(function (watcher) {
      return watcher.run();
    });
  } // 任务队列


  var callbacks = []; // 是否等待任务刷新

  var waiting = false;
  /**
   * 刷新异步回调函数队列
   */

  function flushCallbacks() {
    var cbs = _toConsumableArray(callbacks);

    callbacks = [];
    waiting = false;
    cbs.forEach(function (cb) {
      return cb();
    });
  }
  /**
   * 优雅降级  Promise -> MutationObserve -> setImmediate -> setTimeout(需要开线程 开销最大)
   */


  var timerFunc = null;

  if (Promise) {
    timerFunc = function timerFunc() {
      return Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    // 创建并返回一个新的 MutationObserver 它会在指定的DOM发生变化时被调用（异步执行callback）。
    var observer = new MutationObserver(flushCallbacks); // TODO 创建文本节点的API 应该封装 为了方便跨平台

    var textNode = document.createTextNode(1);
    console.log("observer-----------------"); // 监控文本值的变化

    observer.observe(textNode, {
      characterData: true
    });

    timerFunc = function timerFunc() {
      return textNode.textContent = 2;
    };
  } else if (setImmediate) {
    // IE平台
    timerFunc = function timerFunc() {
      return setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      return setTimeout(flushCallbacks, 0);
    };
  }
  /**
   * 异步批处理
   * 是先执行内部的回调 还是用户的？ 用个队列 排序
   * @param {Function} cb 回调函数
   */


  function nextTick(cb) {
    // 使用队列维护nextTick中的callback方法
    callbacks.push(cb);

    if (!waiting) {
      // setTimeout(flushCallbacks, 0); // 刷新
      // 使用vue的原理 优雅降级
      timerFunc();
      waiting = true;
    }
  }

  /*
   * @Author: 毛毛
   * @Date: 2022-04-14 14:10:39
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-15 10:15:07
   * 组件挂载 生命周期
   * vm._render() 生成虚拟节点 vNode
   * vm._update() 虚拟节点变成真实节点 dom
   */

  function mountComponent(vm, container) {
    // 记录需要挂载的容器 $el
    Object.defineProperty(vm, "$el", {
      value: container,
      writable: true
    }); // 这里把渲染逻辑封装到watcher中

    var updateComponent = function updateComponent() {
      // 1.调用render 产生虚拟节点 vNode
      var vNodes = vm._render(); // 2. 根据虚拟dom 产生真实dom


      vm._update(vNodes);
    };

    new Watcher(vm, updateComponent, true); // // 1.调用render 产生虚拟节点 vNode
    // const vNodes = vm._render();
    // // 2. 根据虚拟dom 产生真实dom
    // vm._update(vNodes);
    // 3. 挂载到container上
  }
  /**
   * 扩展原型方法
   * @param {*} Vue
   */

  function initLifeCycle(Vue) {
    Object.defineProperties(Vue.prototype, {
      _render: {
        // 当渲染的时候，会去实例中取值，我们就可以将属性和视图绑定在一起
        value: function _render() {
          var vm = this; // 绑定 this为组件实例

          return vm.$options.render.call(vm);
        }
      },
      _update: {
        /**
         * 将虚拟dom转为真实dom  vnode -> dom
         * @param {*} vnode 虚拟dom节点
         */
        value: function _update(vnode) {
          var vm = this; // 挂载的容器

          var el = vm.$el; // console.log(el);
          // patch 更新 + 初始化

          vm.$el = patch(el, vnode); // console.log("_update----------------->", vnode);
        }
      },
      // _c("div",{name:'zs'},...children) 元素 虚拟dom
      _c: {
        value: function _c() {
          // this -> vm
          return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
        }
      },
      // _v(text) 文本虚拟dom
      _v: {
        value: function _v() {
          return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
        }
      },
      // 就是变量字符串化
      _s: {
        value: function _s(value) {
          // 对于不是对象的字符串，没必要再次转字符串了，不然会多出引号 zs -> \"zs\"
          return _typeof(value) === "object" ? JSON.stringify(value) : value;
        }
      }
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
    var isRealElement = oldVNode.nodeType; // 真实元素

    if (isRealElement) {
      var elm = oldVNode; // 获取父节点 1. 元素节点 2. 文档节点 3. 文档碎片节点

      var parentElm = elm.parentNode; // console.log(parentElm)

      var newEle = createEle(vnode); // 插入新dom 移除父节点上的老dom节点

      insertBefore(parentElm, newEle, elm.nextSibling);
      removeChild(parentElm, elm); // console.log(newEle)

      return newEle;
    }
  }

  function createEle(vnode) {
    var tag = vnode.tag,
        props = vnode.props,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === "string") {
      // 标签 div h2
      // 将虚拟节点和真实节点想管理 根据虚拟节点可以找到真实节点 方便修改属性
      vnode.el = createElement(tag); // 更新属性

      patchProps(vnode.el, props);
      children.forEach(function (child) {
        appendChild(vnode.el, createEle(child));
      });
    } else if (_typeof(tag) === "object") ; else {
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
    for (var key in props) {
      if (key === "style") {
        Object.keys(props[key]).forEach(function (k) {
          return el.style[k] = props["style"][k];
        });
      } else {
        setAttribute(el, key, props[key]);
      }
    }
  }

  function createElement(tag) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "browser";

    switch (type.toLowerCase()) {
      case "browser":
        return document.createElement(tag);
    }
  }

  function createTextNode(tag) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "browser";

    switch (type.toLowerCase()) {
      case "browser":
        return document.createTextNode(tag);
    }
  }

  function appendChild(parent, child) {
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "browser";

    switch (type.toLowerCase()) {
      case "browser":
        parent.appendChild(child);
        break;
    }
  }

  function setAttribute(el, key, value) {
    var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "browser";

    switch (type.toLowerCase()) {
      case "browser":
        el.setAttribute(key, value);
        break;
    }
  }

  function removeChild(parent, child) {
    var type = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "browser";

    switch (type.toLowerCase()) {
      case "browser":
        parent.removeChild(child);
        break;
    }
  }

  function insertBefore(parent, child, prevChild) {
    var type = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "browser";

    switch (type.toLowerCase()) {
      case "browser":
        // document.insertBefore
        parent.insertBefore(child, prevChild);
        break;
    }
  }

  /*
   * @Author: 毛毛
   * @Date: 2022-04-15 21:16:58
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-15 21:20:16
   * 执行生命周期的hook
   */
  function callHook(vm, hook) {
    var handles = vm.$options[hook]; // 生命周期的钩子的this 都是当前实例

    handles === null || handles === void 0 ? void 0 : handles.forEach(function (handle) {
      return handle.call(vm);
    });
  }

  /*
   * @Author: 毛毛
   * @Date: 2022-04-12 22:48:39
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-15 21:21:43
   */
  function initMixin(Vue) {
    /**
     * 初始化操作
     * @param {*} options
     */
    Vue.prototype._init = function _init(options) {
      // console.log("init------------>", options);
      // vue app.$options = options 获取用户配置
      var vm = this; // 合并 Vue.options 和 传入的配置项
      // TODO 目前还只是可以合并生命周期和普通属性等，对于 data 这种选项还需要特殊的合并处理

      vm.$options = mergeOptions(this.constructor.options, options); // vue认为 $xxx 就是表示vue的属性

      console.log(vm.$options); // 执行初始化之前，执行 beforeCreate 的钩子

      callHook(vm, "beforeCreate"); // 初始化状态

      initState(vm); // 状态初始化完毕之后，执行 created 钩子

      callHook(vm, "created"); // TODO 编译模板 等...
      // el vm挂载到的dom容器

      if (options.el) vm.$mount(options.el);
    };

    Vue.prototype.$mount = function $mount(el) {
      var vm = this;
      var ops = vm.$options;
      el = document.querySelector(el);
      var template; // 是否有render函数
      // 没有render

      if (!ops.render) {
        // 没有template选项 但是写了el 直接用el作为模板
        if (!ops.template && el) template = el.outerHTML;else if (el) template = ops.template;
      } // 有template 直接用模板


      if (template) {
        // TODO 去除开头和结尾的空白符 m是忽略换行 进行多行匹配
        // template = template.trim();
        template = template.replace(/^\s+|\s+$/gm, ""); // 编译模板 生成 render函数

        var render = compileToFunction(template);
        ops.render = render;
      } // console.log("$mount template-------------->", template);
      // 调用 render 实现页面渲染


      console.log(ops.render); // 组件的挂载

      mountComponent(vm, el);
      /**
       * script 标签引用的是vue.global.js 这个编译过程是在浏览器运行的
       * runtime是不包含模板编译的，整个编译打包的时候是通过loader来转义.vue文件的
       * 用runtime的时候 不能使用模板template（可以使用.vue，loader处理就行了）
       */
    };
  }

  /*
   * @Author: 毛毛
   * @Date: 2022-04-12 22:45:40
   * @Last Modified by: 毛毛
   * @Last Modified time: 2022-04-15 20:42:57
   */
  /**
   * Vue构造函数
   * @param {*} options 用户选项
   */

  function Vue(options) {
    // 初始化
    this._init(options);
  } // TODO 暂时先这样写


  Vue.prototype.$nextTick = nextTick;
  initMixin(Vue); // 扩展_init方法

  initLifeCycle(Vue); // 拓展生命周期 进行组件的挂载和渲染的方法
  // 静态方法

  initGlobalStaticAPI(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
