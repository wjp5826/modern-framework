import { VNodeFlags, ChildrenFlages } from './h';
import { mount, domProp, patchData } from './render';
import { applyClassName } from "./tool";

/**
 * 比对的基本原则：
 *  1、相同类型的 vnode 才有比对的意义
 *  2、相同的标签元素才有比对的意义
 * @param prevVNode
 * @param nextVNode
 * @param container
 */
export function patch(prevVNode, nextVNode, container) {
  const prevFlag = prevVNode.flags;
  const nextFlag = nextVNode.flags;

  if (prevFlag !== nextFlag) { // 不同类型的 vnode，直接替换
    replaceVNode(prevVNode, nextVNode, container);
  } else if (prevFlag & VNodeFlags.ELEMENT_HTML) {
    patchElement(prevVNode, nextVNode, container);
  } else if (prevFlag & VNodeFlags.ELEMENT_SVG) {
  
  } else if (prevFlag & VNodeFlags.FRAGMENT) {

  } else if (prevFlag & VNodeFlags.PORTAL) {

  } else if (prevFlag & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {

  } else if (prevFlag & VNodeFlags.COMPONENT_FUNCTIONAL) {

  } else if (prevFlag & VNodeFlags.TEXT) {
    patchText(prevVNode, nextVNode);
  }
}

function replaceVNode(prevVNode, nextVNode, container) {
  // TODO: 需要移除事件
  // 移除旧节点
  container.removeChild(prevVNode.el);
  // 挂载新节点
  mount(nextVNode, container);
}
/**
 * 更新 element
 * @param {*} prevVNode 
 * @param {*} nextVNode 
 * @param {*} container 
 */
function patchElement(prevVNode, nextVNode, container) {

  console.log('prevVNode', prevVNode)
  console.log('nextVNode', nextVNode)

  const prevTag = prevVNode.tag;
  const nextTag = nextVNode.tag;
  
  if (prevTag !== nextTag) { // 标签不同，没有对比意义，直接替换
    replaceVNode(prevVNode, nextVNode, container);
    return;
  }
  // 更新 vnodedata
  const el = (nextVNode.el = prevVNode.el);
  const prevData = prevVNode.data;
  const nextData = nextVNode.data;
  // 应用新的属性或者事件
  if (nextData) {
    for (let key in nextData) {
      // 有class、style、on等
      patchData(el, key, prevData, nextData);
    }
  }
  // 移除旧有的属性或者事件
  if (prevData) {
    for (let k in prevData) {
      if (prevData[k] && !nextData.hasOwnProperty(k)) {
        patchData(el, key, null, nextData);
      }
    }
  }
  const prevChildFlag = prevVNode.childrenFlag;
  const nextChildFlag = nextVNode.childrenFlag;
  // 更新children
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
  switch(prevChildFlag) {
    case ChildrenFlages.NO_CHILDREN:
      switch (nextChildFlag) {
        case ChildrenFlages.NO_CHILDREN:
          break;
        case ChildrenFlages.SINGLE_VNODE:
          mount(nextVNode, container);
          break;
        default:
          nextVNode.children.forEach(ele => {
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
          container.removeChild(prevVNode.el);
          // 挂载新的节点
          nextVNode.children.forEach(ele => {
            mount(ele, container);
          });
      }
      break;
    default: // 多个子节点
      switch (nextChildFlag) {
        case ChildrenFlages.NO_CHILDREN:
          prevVNode.children.forEach(ele => {
            container.removeChild(ele.el);
          });
          break;
        case ChildrenFlages.SINGLE_VNODE:
          // 先移除再挂载
          prevVNode.children.forEach(ele => {
            container.removeChild(ele.el);
          });
          mount(nextVNode, container);
          break;
        default:
          // 多节点比较，diff算法
      }
  }
}

function patchText(prevVNode, nextVNode) {
  const el = (nextVNode.el = prevVNode.el);
  if (prevVNode.children !== nextVNode.children) {
    el.nodeValue = nextVNode.children;
  }
}