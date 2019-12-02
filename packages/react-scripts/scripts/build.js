// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// @remove-on-eject-end
'use strict';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'production';
process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const path = require('path');
const fs = require('fs-extra');
const paths = require('../config/paths');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const execSync = require('child_process').execSync;

const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml])) {
  process.exit(1);
}

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const createFinalProjectStructure = require('./utils/createFinalProjectStructure');
checkBrowsers(paths.appPath, isInteractive)
  .then(async () => {
    await createFinalProjectStructure();
    const cdCommand = `cd ${paths.finalProjectDir}/`
    if (!process.argv.includes('ignore-npm')) {
      execSync(`${cdCommand} && npm install --only=prod`, { stdio: 'inherit' });
    }
    execSync(`${cdCommand} && npm run build`, { stdio: 'inherit' });
    fs.copySync(path.join(paths.finalProjectDir, 'build'), 'build');
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
