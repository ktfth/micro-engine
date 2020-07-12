'use strict';
let root = this;
const vm = require('vm');
const assert = require('assert');

function replace(expression, context) {
  const self = this;
  let out = '';
  self.matches.forEach(matched => {
    out = expression.replace(self.key, context[self.key]);
  });
  return out;
}

function traverse(expression, context) {
  let out = expression;
  Object.keys(context).forEach(key => {
    let matches = [...out.matchAll(key)];
    out = replace.call({ matches: matches, key: key }, out, context);
  });
  return out;
}

const rTemplate = new RegExp('(\{\{.*?\}\})', 'ig');
const rVM = new RegExp('(\{\%.*?\%\})', 'ig');

function reproduce(code, context) {
  let out = code;
  vm.createContext(context);
  out = vm.runInContext(code, context);
  return out;
}

function cleanTemplateOutput(expression) {
  let out = expression;
  if (out.replace !== undefined) {
    out = out.replace('{{', '');
    out = out.replace('}}', '');
  }
  return out;
}

function cleanVMOutput(expression) {
  let out = expression;
  if (out.replace !== undefined) {
    out = out.replace('{%', '');
    out = out.replace('%}', '');
  }
  return out;
}

function cleanAllTemplateOutput(expression) {
  let out = expression;
  if (out.replace !== undefined) {
    out = out.replace(/\{\{/g, '');
    out = out.replace(/\}\}/g, '');
  }
  return out;
}

function cleanAllVMOutput(expression) {
  let out = expression;
  if (out.replace !== undefined) {
    out = out.replace(/\{\%/g, '');
    out = out.replace(/\%\}/g, '');
  }
  return out;
}

function produce(expression, context) {
  let out = expression;
  out = traverseStepContext(out, context);
  return out;
}

function reflect(expression, context) {
  let out = expression;
  out = produce(out, context);
  out = cleanAllVMOutput(out);
  out = reproduce(out, context);
  return out;
}

function traverseStepContext(expression, context) {
  let out = expression;
  if (context !== undefined) {
    Object.keys(context).forEach(key => {
      let current = {};
      current[key] = context[key];
      if (expression.indexOf(key) > -1) {
        out = traverse(out, current);
      }
    });
  }
  return out;
}

function render(expression, context) {
  let self = this;
  let out = expression;
  let templateExpressions = [...out.matchAll(rTemplate)];
  let vmExpressions = [...out.matchAll(rVM)];
  if (templateExpressions.length > 0) {
    for (let i = 0; i < templateExpressions.length; i += 1) {
      let currentExpression = templateExpressions[i];
      let fragment = produce(currentExpression[0], context);
      out = out.replace(currentExpression[0], fragment);
      out = cleanTemplateOutput(out);
    }
  } if (vmExpressions.length > 0) {
    for (let i = 0; i < vmExpressions.length; i += 1) {
      let currentExpression = vmExpressions[i];
      let fragment = reflect(currentExpression[0], context);
      out = out.replace(currentExpression[0], fragment);
    }
  }
  return out;
}
root.render = render;
assert.equal(render('{{message}}', { message: 'hello world' }), 'hello world');
assert.equal(render('{{message}} {{message}}', {
  message: 'hello world'
}), 'hello world hello world');
assert.equal(render('{{firstValue}} + {{secondValue}}', {
  firstValue: 2,
  secondValue: 3,
}), '2 + 3');
assert.equal(render('{%firstValue + secondValue%}', {
  firstValue: 3,
  secondValue: 7,
}), '10');
assert.equal(render('{{firstValue}} + {{secondValue}} = {% firstValue + secondValue %}', {
  firstValue: 3,
  secondValue: 7,
}), '3 + 7 = 10');
