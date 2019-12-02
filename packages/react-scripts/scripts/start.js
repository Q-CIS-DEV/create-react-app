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
process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Ensure environment variables are read.
require('../config/env');

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const paths = require('../config/paths');
const chokidar = require('chokidar');
const { execSync, spawn } = require('child_process');

const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml])) {
  process.exit(1);
}

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow('http://bit.ly/CRA-advanced-config')}`
  );
  console.log();
}

// We require that you explictly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require('react-dev-utils/browsersHelper');
const copyAndMerge = require('./utils/copyAndMerge');

const refreshFiles = (event, filePath) => {
  const finalPath = path.join(paths.finalProjectDir, filePath)
  if (/^unlink/i.test(event)) {
    try {
      fs.removeSync(finalPath);
    } catch (err) {
      console.log(err)
    }
  } else if (/dir$/i.test(event)) {
    fs.ensureDirSync(finalPath)
  } else {
    copyAndMerge(filePath, finalPath);
  }
};

const createFinalProjectStructure = require('./utils/createFinalProjectStructure');
checkBrowsers(paths.appPath, isInteractive)
  .then(async () => {
    await createFinalProjectStructure();
    const cdCommand = `cd ${paths.finalProjectDir}/`;
    if (!process.argv.includes('ignore-npm')) {
      execSync(`${cdCommand} && npm install --only=prod`, { stdio: 'inherit' });
    }

    // Start watcher, so we can copy src files to dev env
    const watcher = chokidar.watch(['src', 'public'], {
      ignoreInitial: true,
      followSymlinks: false,
      cwd: '.',
    });
    watcher.on('all', refreshFiles);

    const startProcess = spawn(
      /^win/.test(process.platform) ? 'npm.cmd' : 'npm',
      ['run', 'start'],
      {
        stdio: 'inherit',
        cwd: paths.finalProjectDir,
      }
    );
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
