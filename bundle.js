'use strict';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var VNodeFlags = {
  // html 标签
  ELEMENT_HTML: 1,
  // SVG
  ELEMENT_SVG: 1 << 1,
  // 普通有状态组件
  COMPONENT_STATEFUL_NORMAL: 1 << 2,
  // 需要被 keepAlive 的有状态组件
  COMPONENT_STATEFUL_SHOULD_KEEP_ALIVE: 1 << 3,
  // 已经被 keep alive 的有状态组件
  COMPONENT_STATEFUL_KEEP_ALICE: 1 << 4,
  // 函数式组件
  COMPONENT_FUNCTIONAL: 1 << 5,
  // 纯文本
  TEXT: 1 << 6,
  // fragment
  FRAGMENT: 1 << 7,
  // portal
  PORTAL: 1 << 8
};
var ChildrenFlages = {
  // 未知的 children
  UNKNOW_CHILDREN: 0,
  // 没有children
  NO_CHILDREN: 1,
  // children 是单个 VNode
  SINGLE_VNODE: 1 << 1,
  // children 是拥有多个key的 VNode
  KEYED_VNODES: 1 << 2,
  // children 是多个没有 key 的 vnode
  NO_KEYED_VNODES: 1 << 3
};
ChildrenFlages.MULTIPLE_VNODES = ChildrenFlages.KEYED_VNODES | ChildrenFlages.NO_KEYED_VNODES;
/**
 * 如果 children 没有 key，就添加key
 * @param {*} children 
 */

function normalizeVnodes(children) {
  var newChildren = [];

  for (var i = 0; i < children.length; i++) {
    if (children[i].key == null) {
      children[i].key = "-".concat(i);
    }

    newChildren.push(children[i]);
  }

  return newChildren;
}
/**
 * 创建文本节点
 * @param {*} text 
 */


function createTextNode(text) {
  return {
    _isVNode: true,
    flags: VNodeFlags.TEXT,
    tag: null,
    data: null,
    children: text,
    childrenFlag: ChildrenFlages.NO_CHILDREN,
    el: null
  };
}
var Fragment = Symbol();
var Portal = Symbol();
/**
 * 创建vnode
 * @param {} tag 标签类型
 * @param {*} data 标签属性
 * @param {*} children 标签子元素
 */

function h(tag) {
  var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
  var children = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
  var flags = null;

  if (typeof tag === 'string') {
    // svg and html
    flags = tag === 'svg' ? VNodeFlags.ELEMENT_SVG : VNodeFlags.ELEMENT_HTML;
  } else if (tag === Fragment) {
    // fragment
    flags = VNodeFlags.FRAGMENT;
  } else if (tag === Portal) {
    // portal
    flags = VNodeFlags.PORTAL;
    tag = data && data.target;
  } else {
    // 兼容 vue2 的对象式组件
    if (tag !== null && _typeof(tag) === 'object') {
      flags === tag.functional ? VNodeFlags.COMPONENT_FUNCTIONAL : VNodeFlags.COMPONENT_STATEFUL_NORMAL;
    } else if (typeof tag === 'function') {
      // class 组件
      flags = tag.prototype && tag.prototype.render ? VNodeFlags.COMPONENT_STATEFUL_NORMAL : VNodeFlags.COMPONENT_FUNCTIONAL;
    }
  } // 确定 children 的类型


  var childrenFlag = null;

  if (Array.isArray(children)) {
    var _children = children,
        length = _children.length;

    if (length === 0) {
      // 没有 children
      childrenFlag = ChildrenFlages.NO_CHILDREN;
    } else if (length === 1) {
      // 单个 children
      childrenFlag = ChildrenFlages.SINGLE_VNODE;
      children = children[0];
    } else {
      // 多个 子节点，且子节点使用 key
      childrenFlag = ChildrenFlages.KEYED_VNODES;
      children = normalizeVnodes(children);
    }
  } else if (children == null) {
    // 没有子节点
    childrenFlag = ChildrenFlages.NO_CHILDREN;
  } else if (children._isVNode) {
    // 单个子节点
    childrenFlag = ChildrenFlages.SINGLE_VNODE;
  } else {
    // 文本节点
    childrenFlag = ChildrenFlages.SINGLE_VNODE;
    children = createTextNode(children + '');
  }

  return {
    el: null,
    _isVNode: true,
    flags: flags,
    tag: tag,
    data: data,
    childrenFlag: childrenFlag,
    children: children
  };
}

/**
 * 获取值的类型
 * @param val
 * @returns {*}
 */
function getType(val) {
  if (val === null) return 'null';

  if (_typeof(val) !== 'object') {
    return _typeof(val);
  } else {
    return Object.prototype.toString.call(val).split(' ')[1].split(']')[0].toLowerCase();
  }
}
/**
 * 应用类名
 * @param classList
 * @param list
 * @returns {Array}
 */

function applyClassName(classList) {
  var list = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

  if (getType(classList) === 'string') {
    list.push(classList);
    return list;
  } else if (getType(classList) === 'array') {
    classList.forEach(function (ele) {
      applyClassName(ele, list);
    });
    return list;
  } else if (getType(classList) === 'object') {
    for (var className in classList) {
      if (classList[className]) {
        list.push(className);
      }
    }

    return list;
  }
}

/**
 * 比对的基本原则：
 *  1、相同类型的 vnode 才有比对的意义
 *  2、相同的标签元素才有比对的意义
 * @param prevVNode
 * @param nextVNode
 * @param container
 */

function patch(prevVNode, nextVNode, container) {
  var prevFlag = prevVNode.flags;
  var nextFlag = nextVNode.flags;

  if (prevFlag !== nextFlag) {
    // 不同类型的 vnode，直接替换
    replaceVNode(prevVNode, nextVNode, container);
  } else if (prevFlag & VNodeFlags.ELEMENT_HTML) {
    patchElement(prevVNode, nextVNode, container);
  }
}

function replaceVNode(prevVNode, nextVNode, container) {
  // TODO: 需要移除事件
  // 移除旧节点
  container.removeChild(prevVNode.el); // 挂载新节点

  mount(nextVNode, container);
}
/**
 * 更新 element
 * @param {*} prevVNode 
 * @param {*} nextVNode 
 * @param {*} container 
 */


function patchElement(prevVNode, nextVNode, container) {
  console.log('prevVNode', prevVNode);
  console.log('nextVNode', nextVNode);
  var prevTag = prevVNode.tag;
  var nextTag = nextVNode.tag;

  if (prevTag !== nextTag) {
    // 标签不同，没有对比意义，直接替换
    replaceVNode(prevVNode, nextVNode, container);
    return;
  } // 更新 vnodedata


  var el = nextVNode.el = prevVNode.el;
  var prevData = prevVNode.data;
  var nextData = nextVNode.data;

  if (nextData) {
    for (var key in nextData) {
      // 有class、style、on等
      switch (key) {
        case 'style':
          // 添加新的style属性
          for (var s in nextData[key]) {
            el.style[s] = nextData[key][s];
          } // 移除旧 style 中不存在的属性


          for (var k in prevData) {
            if (!nextData[key].hasOwnProperty(k)) {
              el.style[k] = '';
            }
          }

          break;

        case 'class':
          // 可能的值有对象、数组、或者是字符串
          var c = nextData[key]; // class对应的值

          var classList = applyClassName(c);
          el.className = classList.join(' ');
          break;

        default:
          // 事件
          if (key.slice(0, 2) === 'on') {
            el.addEventListener(key.slice(2), data[key]);
            break;
          } // 标签属性


          if (domProp.test(key)) {
            // 以 property 方式添加
            el[key] = data[key];
          } else {
            el.setAttribute(key, data[key]);
          }

          break;
      }
    }
  }

  var prevChildFlag = prevVNode.childrenFlag;
  var nextChildFlag = nextVNode.childrenFlag; // 更新children
  // 总共九种情况

  /**
   *   没有子节点
   *      没有子节点
   *      单个子节点
   *      多个子节点
   *   单个子节点
   *      没有子节点
   *      单个子节点
   *      多个子节点
   *   多个子节点
   *      没有子节点
   *      单个子节点
   *      多个子节点
   */

  switch (prevChildFlag) {
    case ChildrenFlages.NO_CHILDREN:
      switch (nextChildFlag) {
        case ChildrenFlages.NO_CHILDREN:
          break;

        case ChildrenFlages.SINGLE_VNODE:
          mount(nextVNode, container);
          break;

        default:
          nextVNode.children.forEach(function (ele) {
            mount(ele, container);
          });
      }

      break;

    case ChildrenFlages.SINGLE_VNODE:
      switch (nextChildFlag) {
        case ChildrenFlages.NO_CHILDREN:
          container.removeChild(prevVNode.el);
          break;

        case ChildrenFlages.SINGLE_VNODE:
          patch(prevVNode.children, nextVNode.children, container);
          break;

        default:
          // 移除旧的节点
          container.removeChild(prevVNode.el); // 挂载新的节点

          nextVNode.children.forEach(function (ele) {
            mount(ele, container);
          });
      }

      break;

    default:
      // 多个子节点
      switch (nextChildFlag) {
        case ChildrenFlages.NO_CHILDREN:
          prevVNode.children.forEach(function (ele) {
            container.removeChild(ele.el);
          });
          break;

        case ChildrenFlages.SINGLE_VNODE:
          // 先移除再挂载
          prevVNode.children.forEach(function (ele) {
            container.removeChild(ele.el);
          });
          mount(nextVNode, container);
          break;

      }

  }
}

var domProp = /\[A-Z]|^(?:value|checked|selected|muted)$/;
function render(vnode, container) {
  var prevNode = container.vnode;

  if (prevNode == null) {
    // 旧的没有，只有新的
    mount(vnode, container);
    container.vnode = vnode;
  } else {
    if (vnode) {
      // 新旧 vnode 都有，需要执行 patch进行对比
      patch(prevNode, vnode, container);
    }
  }
}
/**
 * 挂载节点处理器
 * @param {*} vnode 
 * @param {*} container 
 * @param {是否是 svg 标签} isSVG 
 */

function mount(vnode, container, isSVG) {
  var flags = vnode.flags;

  if (flags & VNodeFlags.ELEMENT_HTML) {
    // 普通节点
    mountElement(vnode, container, isSVG);
  } else if (flags & VNodeFlags.TEXT) {
    // 纯文本
    mountText(vnode, container);
  } else if (flags & VNodeFlags.FRAGMENT) {
    // fragment
    mountFragment(vnode, container);
  } else if (flags & VNodeFlags.PORTAL) {
    // portal
    mountPortal(vnode);
  } else if (flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
    // 有状态组件
    mountStatefulComponent(vnode, container, isSVG);
  } else if (flags & VNodeFlags.COMPONENT_FUNCTIONAL) {
    mountFunctionComponent(vnode, container, isSVG);
  }
}
/**
 * 挂载普通元素
 * @param {*} vnode 
 * @param {*} container 
 */

function mountElement(vnode, container, isSVG) {
  isSVG = isSVG || vnode.flags & VNodeFlags.ELEMENT_SVG;
  var el = isSVG ? document.createElementNS('http://www.w3.org/2000/svg', vnode.tag) : document.createElement(vnode.tag);
  vnode.el = el;
  var data = vnode.data;
  console.log('vnode', vnode);

  if (data) {
    for (var key in data) {
      // 有class、style、on等
      switch (key) {
        case 'style':
          for (var s in data[key]) {
            el.style[s] = data[key][s];
          }

          break;

        case 'class':
          // 可能的值有对象、数组、或者是字符串
          var c = data[key]; // class对应的值

          var classList = applyClassName(c);
          el.className = classList.join(' ');
          break;

        default:
          if (key.slice(0, 2) === 'on') {
            el.addEventListener(key.slice(2), data[key]);
            break;
          }

          if (domProp.test(key)) {
            // 以 property 方式添加
            el[key] = data[key];
          } else {
            el.setAttribute(key, data[key]);
          }

          break;
      }
    }
  } // 挂载子节点，子节点多个或者是单个


  var childrenFlag = vnode.childrenFlag,
      children = vnode.children;

  if (vnode.children) {
    if (childrenFlag !== ChildrenFlages.NO_CHILDREN) {
      if (childrenFlag & ChildrenFlages.SINGLE_VNODE) {
        // 挂载单个子节点
        mount(children, el, isSVG);
      } else if (childrenFlag & ChildrenFlages.MULTIPLE_VNODES) {
        for (var i = 0; i < children.length; i++) {
          mount(children[i], el, isSVG);
        }
      }
    }
  }

  container.appendChild(el);
}
/**
 * 挂载fragment
 * @param {*} vnode 
 * @param {*} container 
 */


function mountFragment(vnode, container) {
  var children = vnode.children,
      childrenFlag = vnode.childrenFlag;

  switch (childrenFlag) {
    case ChildrenFlages.SINGLE_VNODE:
      mount(children, container);
      break;

    case ChildrenFlages.NO_CHILDREN:
      var textVnode = createTextNode('');
      mountText(textVnode, container);
      break;

    default:
      children.forEach(function (ele) {
        mount(ele, container);
      });
  }
}
/**
 * 挂载 portal
 * @param {*} vnode 
 */


function mountPortal(vnode, container) {
  var children = vnode.children,
      childrenFlag = vnode.childrenFlag,
      tag = vnode.tag; // 挂载点

  var target = document.querySelector(tag);

  if (childrenFlag & ChildrenFlages.SINGLE_VNODE) {
    // 挂载单个
    mount(children, target);
  } else {
    Array.prototype.call.forEach(children, function (ele) {
      mount(ele, target);
    });
  }
}
/**
 * 挂载有状态组件
 * @param {*} vnode 
 * @param {*} container 
 * @param {*} isSVG 
 */


function mountStatefulComponent(vnode, container, isSVG) {
  // 创建组件实例
  var instance = new vnode.tag(); // 生成vnode

  instance.$vnode = instance.render(); // 挂载

  mount(instance.$vnode, container, isSVG); // 保存下实例

  instance.$el = vnode.el = instance.$vnode.el;
}
/**
 * 挂载函数式组件
 * @param {*} vnode 
 * @param {*} container 
 * @param {*} isSVG 
 */


function mountFunctionComponent(vnode, container, isSVG) {
  // 生成vnode
  var $vnode = vnode.tag(); // 挂载

  mount($vnode, container, isSVG); // 引用实例

  vnode.el = $vnode.el;
}
/**
 * 挂载文本
 * @param {*} vnode 
 * @param {*} container 
 */


function mountText(vnode, container) {
  var text = document.createTextNode(vnode.children);
  vnode.el = text;
  container.appendChild(text);
}

//   style: {
//     height: '90px',
//     width: '100%',
//     background: '#e2e2e2'
//   },
//   onclick: handler
// }, [
//   h('div', { class: { 'b': false, 'c': true } }, 'first'),
//   h(Fragment, null, [
//     h('span', null, 'nihao'),
//     h('div', null, 'wobuhao'),
//     h(Portal, { target: '#app' }, h('span', null, "hqll"))
//   ])
// ]);
// const nextNode = h(Fragment, null, [
//   h('div', null, 'hello'),
//   h('div', null, 'world')
// ]);


var node = h('div', {
  "class": {
    a: true,
    b: true
  },
  style: {
    height: '20px',
    background: 'red'
  }
}, '123');
var next = h('div', {
  style: {
    height: '20px',
    background: 'blue'
  }
}, '123');
render(node, document.getElementById('app'));
setTimeout(function () {
  render(next, document.getElementById('app'));
}, 2000);
