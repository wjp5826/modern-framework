import { VNodeFlags, ChildrenFlages, createTextNode } from './h';
import { applyClassName } from './tool';
import { patch } from './patch';

export const domProp = /\[A-Z]|^(?:value|checked|selected|muted)$/

export default function render(vnode, container) {
  const prevNode = container.vnode;  
  if (prevNode == null) {
    // 旧的没有，只有新的
    mount(vnode, container);
    container.vnode = vnode;
  } else {
    if (vnode) {
      // 新旧 vnode 都有，需要执行 patch进行对比
      patch(prevNode, vnode, container);
    } else {
      // 有旧的 vnode，没有新的，该执行删除
      
    }
  }
}
/**
 * 挂载节点处理器
 * @param {*} vnode 
 * @param {*} container 
 * @param {是否是 svg 标签} isSVG 
 */
export function mount(vnode, container, isSVG) {
  const { flags } = vnode;
  if (flags & VNodeFlags.ELEMENT_HTML) { // 普通节点
    mountElement(vnode, container, isSVG);
  } else if (flags & VNodeFlags.TEXT) { // 纯文本
    mountText(vnode, container);
  } else if (flags & VNodeFlags.FRAGMENT) { // fragment
    mountFragment(vnode, container);
  } else if (flags & VNodeFlags.PORTAL) { // portal
    mountPortal(vnode, container, isSVG);
  } else if (flags & VNodeFlags.COMPONENT_STATEFUL_NORMAL) { // 有状态组件
    mountStatefulComponent(vnode, container, isSVG);
  } else if (flags & VNodeFlags.COMPONENT_FUNCTIONAL) {
    mountFunctionComponent(vnode, container, isSVG);
  }
}

/**
 * 挂载普通元素
 * @param vnode
 * @param container
 * @param isSVG
 */
function mountElement(vnode, container, isSVG) {
  isSVG = isSVG || vnode.flags & VNodeFlags.ELEMENT_SVG;
  const el = isSVG
   ? document.createElementNS('http://www.w3.org/2000/svg', vnode.tag)
   : document.createElement(vnode.tag);
  vnode.el = el;
  const data = vnode.data;
  console.log('vnode', vnode)
  if (data) {
    for (let key in data) {
      // 有class、style、on等
      // switch(key) {
      //   case 'style':
      //     for (let s in data[key]) {
      //       el.style[s] = data[key][s];
      //     }
      //     break;
      //   case 'class':
      //     // 可能的值有对象、数组、或者是字符串
      //     const c = data[key]; // class对应的值
      //     const classList = applyClassName(c);
      //     el.className = classList.join(' ');
      //     break;
      //   default:
      //     if (key.slice(0, 2) === 'on') {
      //       el.addEventListener(key.slice(2), data[key]);
      //       break;
      //     }
      //     if (domProp.test(key)) { // 以 property 方式添加
      //       el[key] = data[key];
      //     } else {
      //       el.setAttribute(key, data[key]);
      //     }
      //     break;
      // }
      patchData(el, key, null, data);
    }
  }
  // 挂载子节点，子节点多个或者是单个
  const { childrenFlag, children } = vnode;
  if (vnode.children) {
    if (childrenFlag !== ChildrenFlages.NO_CHILDREN) {
      if (childrenFlag & ChildrenFlages.SINGLE_VNODE) { // 挂载单个子节点
        mount(children, el, isSVG);
      } else if (childrenFlag & ChildrenFlages.MULTIPLE_VNODES) {
        for (let i = 0;i < children.length;i++) {
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
  const { children, childrenFlag } = vnode;
  switch(childrenFlag) {
    case ChildrenFlages.SINGLE_VNODE:
      mount(children, container);
      break;
    case ChildrenFlages.NO_CHILDREN:
        const textVnode = createTextNode('');
        mountText(textVnode, container);
      break;
    default:
      children.forEach(ele => {
        mount(ele, container);
      })
  }
}
/**
 * 挂载 portal
 * @param {*} vnode 
 */
function mountPortal(vnode, container) {
  const { children, childrenFlag, tag } = vnode;
  // 挂载点
  const target = document.querySelector(tag);

  if (childrenFlag & ChildrenFlages.SINGLE_VNODE) { // 挂载单个
    mount(children, target);
  } else {
    Array.prototype.call.forEach(children, (ele) => {
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
  const instance = new vnode.tag();
  // 生成vnode
  instance.$vnode = instance.render();
  // 挂载
  mount(instance.$vnode, container, isSVG);
  // 保存下实例
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
  const $vnode = vnode.tag();
  // 挂载
  mount($vnode, container, isSVG);
  // 引用实例
  vnode.el = $vnode.el;
}
/**
 * 挂载文本
 * @param {*} vnode 
 * @param {*} container 
 */
function mountText(vnode, container) {
  const text = document.createTextNode(vnode.children);
  vnode.el = text;
  container.appendChild(text);
}

/**
 * 应用vnode data
 * @param el
 * @param key
 * @param prevData
 * @param nextData
 */
export function patchData(el, key, prevData, nextData) {
  switch(key) {
    case 'style':
      // 添加新的style属性
      for (let n in nextData[key]) {
        el.style[n] = nextData[key][n];
      }
      // 移除旧 style 中不存在的属性
      for (let k in prevData) {
        if (!nextData[key].hasOwnProperty(k)) {
          el.style[k] = '';
        }
      }
      break;
    case 'class':
      // 可能的值有对象、数组、或者是字符串
      const c = nextData[key]; // class对应的值
      const classList = applyClassName(c);
      el.className = classList.join(' ');
      break;
    default:
      // 事件
      if (key.slice(0, 2) === 'on') {
        if (prevData) {
          el.removeEventListener(key.slice(2), nextData[key]);
        }
        if (nextData) {
          el.addEventListener(key.slice(2), nextData[key]);
        }
        break;
      }
      // 标签属性
      if (domProp.test(key)) { // 以 property 方式添加
        el[key] = nextData[key];
      } else {
        el.setAttribute(key, nextData[key]);
      }
      break;
  }
}