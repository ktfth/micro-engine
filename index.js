'use strict';
const assert = require('assert');

function render(expression, context) {
  let out = '';
  Object.keys(context).forEach(key => {
    let matches = [...expression.matchAll(key)];
    matches.forEach(matched => {
      out = expression.replace(key, context[key]);
    });
  });
  out = out.replace('{{', '');
  out = out.replace('}}', '');
  return out;
}
assert.equal(render('{{message}}', {message: 'hello world'}), 'hello world');
