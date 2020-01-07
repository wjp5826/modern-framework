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

const nextNode = h(Fragment, null, [
  h('div', null, 'hello')
]);
const node = h(Fragment, null, [
  h('div', null, 'world')
]);

const next = h('span', null, '123');

// const nextNode = h('span', null, '456');

render(nextNode, document.getElementById('app'));

setTimeout(() => {
  render(node, document.getElementById('app'));
}, 2000);