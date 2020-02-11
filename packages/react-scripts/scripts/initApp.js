// @remove-file-on-eject
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const fs = require('fs-extra');
const path = require('path');
const execSync = require('child_process').execSync;
const { defaultBrowsers } = require('react-dev-utils/browsersHelper');
const os = require('os');


const troodCoreScriptsPath = path.join(__dirname, '..')
const appPath = process.cwd()

const initPackage = function() {
  console.log('init package.json...')
  const appPackage = require(path.join(appPath, 'package.json'));
  appPackage.devDependencies = {
    ...appPackage.devDependencies,
    '@typescript-eslint/eslint-plugin': '^2.9.0',
    '@typescript-eslint/parser': '^2.9.0',
    'babel-eslint': '^10.0.3',
    'eslint': '^6.7.1',
    'eslint-config-react-app': '^5.0.2',
    'eslint-plugin-flowtype': '^4.5.2',
    'eslint-plugin-import': '^2.18.2',
    'eslint-plugin-jsx-a11y': '^6.2.3',
    'eslint-plugin-react': '^7.17.0',
    'eslint-plugin-react-hooks': '^2.3.0',
    'pre-commit': '^1.2.2',
    'stylelint': '^12.0.0',
    'stylelint-config-standard': '^19.0.0',
    "trood-core-react-scripts": "1.0.0"
  }

  appPackage.scripts = {
    'lint': 'npm run jslint && npm run stylelint',
    'jslint': 'eslint src/ --ext .js',
    'stylelint': 'stylelint "src/**/*.css"',
    'start': 'trood-core-react-scripts start',
    'build': 'trood-core-react-scripts build',
    'pot': 'rip json2pot "./.trood-core/translate/messages/**/*.json" -c "id" -o "./translate/index.pot"',
    'initMeta': 'trood-core-react-scripts initMeta',
  }

  appPackage['pre-commit'] = ['lint']
  appPackage.browserslist = defaultBrowsers.filter(
    browser => !browser.includes('dead')
  )

  fs.writeFileSync(
    path.join(appPath, 'package.json'),
    JSON.stringify(appPackage, null, 2) + os.EOL
  );
}

const initDir = function() {
  console.log('init directories...')
  const templatePath = path.join(troodCoreScriptsPath, 'template');
  if (fs.existsSync(templatePath)) {
    fs.copySync(templatePath, appPath);
  }
  try {
    fs.moveSync(
      path.join(appPath, 'gitignore'),
      path.join(appPath, '.gitignore'),
      []
    );
  } catch (err) {
    // Append if there's already a `.gitignore` file there
    if (err.code === 'EEXIST') {
      const data = fs.readFileSync(path.join(appPath, 'gitignore'));
      fs.appendFileSync(path.join(appPath, '.gitignore'), data);
      fs.unlinkSync(path.join(appPath, 'gitignore'));
    } else {
      throw err;
    }
  }
}

const installPkg = function () {
  console.log('npm install')
  execSync('npm i', { cwd: appPath })
}

initPackage()
initDir()
installPkg()

console.log('finish')


