const readline = require('readline');
const { Writable } = require('stream');
const fs = require('fs');
const util = require('util');

const ask = (question, muted = false) =>
  new Promise((resolve) => {
    const mutableStdout = new Writable({
      write: function (chunk, encoding, callback) {
        if (!this.muted) process.stdout.write(chunk, encoding);
        callback();
      },
    });
    mutableStdout.muted = false;
    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true,
    });
    rl.question(question + ':', function (answer) {
      rl.close();
      // To add line after password
      if (muted) console.log('');
      resolve(answer);
    });
    mutableStdout.muted = muted;
  });

const camelToSnake = (s = '') => s.replace(/([a-z])([A-Z]+)/g, '$1_$2');
const camelToLowerSnake = (s) => camelToSnake(s).toLowerCase();
function toCamel(s) {
  return camelToLowerSnake(s).replace(
    /(\B)_+(.)/g,
    (match, g1, g2) => g1 + g2.toUpperCase()
  );
}

function makeBoFolder(path) {
  fs.mkdirSync(path, { recursive: true }, (err) => {
    throw new Error('Not possible to create path ' + path);
  });
}

function addTrailingComma(string) {
  return string.replace(
    /(\w|}|'|])(\r\n|\r|\n)/gi,
    (_, $1, $2) => $1 + ',' + $2
  );
}

function parseObject(obj, spacing = '') {
  return addTrailingComma(
    util.inspect(obj, {
      depth: null,
      breakLength: 1,
    })
  )
    .replace(/^/gm, spacing)
    .slice(spacing.length);
}
module.exports = { ask, toCamel, makeBoFolder, addTrailingComma, parseObject };
