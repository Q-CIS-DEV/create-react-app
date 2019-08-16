'use strict';
const fs = require('fs-extra');
const union = require('lodash/union');

const cssFileRegexp = /\.css$/;
const importLineRegexp = /@import .*$/gm;

const foldersToIgnoreMergeCssRegexp = [
  /^src[\/\\]businessObjects.*\.css$/,
  /^src[\/\\]componentLibraries.*\.css$/,
  /^src[\/\\]layouts[\/\\]TroodCoreDefaultLayout.*\.css$/,
];

module.exports = (fromPath, toPath) => {
  if (
    cssFileRegexp.test(fromPath) &&
    cssFileRegexp.test(toPath) &&
    fs.existsSync(toPath) &&
    !foldersToIgnoreMergeCssRegexp.some(f => f.test(fromPath))
  ) {
    const originalPath = toPath.replace(cssFileRegexp, '.original.css');
    if (!fs.existsSync(originalPath)) {
      fs.copySync(toPath, originalPath);
    }
    const fromFile = fs.readFileSync(fromPath, 'utf8');
    const toFile = fs.readFileSync(originalPath, 'utf8');
    const fromImports = fromFile.match(importLineRegexp);
    const toImports = toFile.match(importLineRegexp);

    const imports = union(fromImports, toImports);

    const resultFile = `
      ${(imports || []).join('\n')}
      ${toFile.replace(importLineRegexp, '')}
      ${fromFile.replace(importLineRegexp, '')}
    `;

    fs.writeFileSync(toPath, resultFile);
  } else {
    fs.copySync(fromPath, toPath);
  }
};
