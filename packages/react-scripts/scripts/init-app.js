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
const chalk = require('chalk');
const execSync = require('child_process').execSync;
const spawn = require('react-dev-utils/crossSpawn');
const { defaultBrowsers } = require('react-dev-utils/browsersHelper');
const os = require('os');
const verifyTypeScriptSetup = require('./utils/verifyTypeScriptSetup');


const troodCoreScriptsPath = path.join(__dirname, '..')
const appPath = path.join(__dirname, '../../..')

const initPackage = function() {
  console.log('init package.json...')
  const appPackage = require(path.join(appPath, 'package.json'));
  appPackage.devDependencies = {
    ...appPackage.devDependencies,
    'eslint': '4.10.0',
    'eslint-config-airbnb': '^16.1.0',
    'eslint-config-react-app': '^2.1.0',
    'eslint-plugin-flowtype': '2.39.1',
    'eslint-plugin-import': '2.8.0',
    'eslint-plugin-jsx-a11y': '5.1.1',
    'eslint-plugin-react': '7.4.0',
    'pre-commit': '^1.2.2',
    'stylelint': '^9.3.0',
    'stylelint-config-standard': '^18.2.0'
  }

  appPackage.scripts = {
    'lint': 'npm run jslint && npm run stylelint',
    'jslint': 'eslint src/ --ext .js',
    'stylelint': 'stylelint "src/**/*.css"',
    'start': 'react-scripts start',
    'build': 'react-scripts build',
    'test': 'react-scripts test',
    'eject': 'react-scripts eject',
    'pot': 'rip json2pot "./.trood-core/translate/messages/**/*.json" -c "id" -o "./translate/index.pot"'
  }

  appPackage['pre-commit'] = ['lint'],
    appPackage.eslintConfig = {
      'extends': 'react-app'
    }
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
  execSync('npm i')
}

initPackage()
initDir()
installPkg()

console.log('finish')


