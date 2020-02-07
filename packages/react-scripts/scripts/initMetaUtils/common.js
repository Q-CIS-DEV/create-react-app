const readline = require("readline");
const { Writable } = require("stream");
const fs = require("fs");

const ask = (question, muted = false) =>
  new Promise(resolve => {
    const mutableStdout = new Writable({
      write: function(chunk, encoding, callback) {
        if (!this.muted) process.stdout.write(chunk, encoding);
        callback();
      }
    });
    mutableStdout.muted = false;
    const rl = readline.createInterface({
      input: process.stdin,
      output: mutableStdout,
      terminal: true
    });
    rl.question(question + ":", function(answer) {
      rl.close();
      // To add line after password
      if (muted) console.log("");
      resolve(answer);
    });
    mutableStdout.muted = muted;
  });

function toCamel(string, separator = "") {
  if (string === string.toUpperCase()) return string;
  return string.replace(/([-_]{1,2}[a-z])/gi, $1 => {
    return $1
      .toUpperCase()
      .replace("-", separator)
      .replace("_", separator);
  });
}

function toName(string){
  const name = toCamel(string, ' ');
  return name.slice(0, 1).toUpperCase() + name.slice(1);
}

function makeBoFolder(path) {
    fs.mkdirSync(path, { recursive: true }, err => {
      throw new Error("Not possible to create path " + path);
    });
  }

module.exports = { ask, toCamel, makeBoFolder, toName };
