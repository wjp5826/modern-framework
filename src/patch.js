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
    patchFragment(prevVNode, nextVNode, container);
  } else if (prevFlag & VNodeFlags.PORTAL) {
    patchPortal(prevVNode, nextVNode, container);
  } else if (prevFlag & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
    patchStatefulComponent(prevVNode, nextVNode, container);
  } else if (prevFlag & VNodeFlags.COMPONENT_FUNCTIONAL) {
    patchFunctionComponent(prevVNode, nextVNode, container);
  } else if (prevFlag & VNodeFlags.TEXT) {
    patchText(prevVNode, nextVNode);
  }
}

function replaceVNode(prevVNode, nextVNode, container) {
  // TODO: 需要移除事件
  // 移除旧节点
  container.removeChild(prevVNode.el);
  if (prevVNode.childrenFlag & VNodeFlags.COMPONENT_STATEFUL_NORMAL) {
    const instance = prevVNode.children;
    instance.destory = instance.destory();
  }
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
  const prevChildren = prevVNode.children;
  const nextChildren = nextVNode.children;
  
  patchChildren(
    prevChildFlag,
    nextChildFlag,
    prevChildren,
    nextChildren,
    prevVNode.el
  );
}

function patchText(prevVNode, nextVNode) {
  const el = (nextVNode.el = prevVNode.el);
  if (prevVNode.children !== nextVNode.children) {
    el.nodeValue = nextVNode.children;
  }
}

/**
 * 子节点比较
 * @param prevChildFlag
 * @param nextChildFlag
 * @param prevChildren
 * @param nextChildren
 * @param container
 * 九种情况
 * /**
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
function patchChildren(
  prevChildFlag,
  nextChildFlag,
  prevChildren,
  nextChildren,
  container
) {
  switch(prevChildFlag) {
    case ChildrenFlages.NO_CHILDREN:
      switch (nextChildFlag) {
        case ChildrenFlages.NO_CHILDREN:
          break;
        case ChildrenFlages.SINGLE_VNODE:
          mount(nextChildren, container);
          break;
        default:
          nextChildren.forEach(ele => {
            mount(ele, container);
          });
      }
      break;
    case ChildrenFlages.SINGLE_VNODE:
      switch (nextChildFlag) {
        case ChildrenFlages.NO_CHILDREN:
          container.removeChild(prevChildren.el);
          break;
        case ChildrenFlages.SINGLE_VNODE:
          patch(prevChildren, nextChildren, container);
          break;
        default:
          // 移除旧的节点
          container.removeChild(prevChildren.el);
          // 挂载新的节点
          nextChildren.forEach(ele => {
            mount(ele, container);
          });
      }
      break;
    default: // 多个子节点
      switch (nextChildFlag) {
        case ChildrenFlages.NO_CHILDREN:
          prevChildren.forEach(ele => {
            container.removeChild(ele.el);
          });
          break;
        case ChildrenFlages.SINGLE_VNODE:
          // 先移除再挂载
          prevChildren.forEach(ele => {
            container.removeChild(ele.el);
          });
          mount(nextChildren, container);
          break;
        default:
        // 多节点比较，diff算法
        console.log('ttttt', prevChildFlag,
        nextChildFlag,
        prevChildren,
        nextChildren,
        container)
        // 如果在寻找的过程中遇到的索引呈现递增趋势，
          // 则说明新旧 children 中节点顺序相同，不需要移动操作。
          // 相反的，如果在寻找的过程中遇到的索引值不呈现递增趋势，则说明需要移动操作
        let maxIndex = 0;
        let findNewNode = false;
        for (let i = 0;i < nextChildren.length;i++) {
          findNewNode = false;
          for (let j = 0;j < prevChildren.length;j++) {
            if (nextChildren[i].key === prevChildren[j].key) {
              findNewNode = true;
              patch(prevChildren[j], nextChildren[i], container);
              if (j < maxIndex) { // 需要移动
                container.insertBefore(prevChildren[j].el, nextChildren[i-1].el.nextSibling);
              } else {
                maxIndex = j;
              }
              break;
            }
          }
          if (!findNewNode) {
            const node = i === 0 ? prevChildren[0].el : nextChildren[i - 1].el.nextSibling;
            mount(nextChildren[i], container, false, node);
          }
        }
      }
  }
}

/**
 * 对 fragment 打补丁
 * @param prevVNode
 * @param nextVNode
 * @param container
 */
function patchFragment(prevVNode, nextVNode, container) {
  patchChildren(
    prevVNode.childrenFlag,
    nextVNode.childrenFlag,
    prevVNode.children,
    nextVNode.children,
    container
  );
  // 需要处理下实例的引用
  switch (nextVNode.childrenFlag) {
    case ChildrenFlages.SINGLE_VNODE:
      nextVNode.el = nextVNode.children.el;
      break;
    case ChildrenFlages.NO_CHILDREN:
      nextVNode.el = prevVNode.el;
      break;
    default:
      nextVNode.el = nextVNode.children[0].el;
  }
}

/**
 * patch portal
 * 1、比对 children
 * 2、如果挂载目标变了，需要变更dom
 * @param prevVNode
 * @param nextVNode
 * @param container
 */
function patchPortal(prevVNode, nextVNode, container) {
  patchChildren(
    prevVNode.childrenFlag,
    nextVNode.childrenFlag,
    prevVNode.children,
    nextVNode.children,
    prevVNode.el
  );
  // 挂载目标变更
  if (nextVNode.tag !== prevVNode.tag) {
    const tag = document.querySelector(nextVNode.tag);
    switch (nextVNode.childrenFlag) {
      case ChildrenFlages.SINGLE_VNODE:
        tag.appendChild(nextVNode.children.el);
        break;
      case ChildrenFlages.NO_CHILDREN:
        break;
      default:
        nextVNode.children.forEach(ele => {
          tag.appendChild(ele.el);
        });
    }
  }
  // 处理下实例引用
  nextVNode.el = prevVNode.el;
}

/**
 * 组件更新原则，不同的组件渲染不同的内容
 * @param prevVNode
 * @param nextVNode
 * @param container
 */
function patchStatefulComponent(prevVNode, nextVNode, container) {
  if (prevVNode.tag !== nextVNode.tag) {
    replaceVNode(prevVNode, nextVNode, container);
    return;
  }
  const instance = (nextVNode.children = prevVNode.children);
  instance.$props = nextVNode.data;
  instance.update();
}

/**
 * 更新函数式组件
 * @param prevVNode
 * @param nextVNode
 * @param container
 */
function patchFunctionComponent(prevVNode, nextVNode, container) {
  if (prevVNode.tag !== nextVNode.tag) {
    replaceVNode(prevVNode, nextVNode, container);
    return;
  }
  const handle = (nextVNode.handle = prevVNode.handle);
  
  handle.prev = prevVNode;
  handle.next = nextVNode;
  handle.container = container;
  
  handle.update();
}