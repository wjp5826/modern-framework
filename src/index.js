import render from './render';
import { h, Fragment, Portal } from './h';

function handler(params) {
  alert('hello')  
}

// const node = h('div', {
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

const node = h('div', {
  class: {
    a: true,
    b: true
  },
  style: {
    height: '20px',
    background: 'red'
  }
}, '123')

const next = h('div', {
  style: {
    height: '20px',
    background: 'blue'
  }
}, '123')

render(node, document.getElementById('app'));

setTimeout(() => {
  render(next, document.getElementById('app'));
}, 2000);