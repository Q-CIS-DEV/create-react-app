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
// @remove-on-eject-begin
// Do the preflight check (only happens before eject).
const verifyPackageTree = require('./utils/verifyPackageTree');
if (process.env.SKIP_PREFLIGHT_CHECK !== 'true') {
  verifyPackageTree();
}
const verifyTypeScriptSetup = require('./utils/verifyTypeScriptSetup');
verifyTypeScriptSetup();
// @remove-on-eject-end

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const clearConsole = require('react-dev-utils/clearConsole');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const paths = require('../config/paths');
const configFactory = require('../config/webpack.config');
const createDevServerConfig = require('../config/webpackDevServer.config');
const chokidar = require('chokidar');
const debounce = require('lodash/debounce');
const { execSync, spawn } = require('child_process');

const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml])) {
  process.exit(1);
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

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
  if (event === 'unlink') {
    fs.unlinkSync(path.join(paths.finalProjectDir, filePath));
  } else {
    copyAndMerge(filePath, path.join(paths.finalProjectDir, filePath));
  }
};

const createFinalProjectStructure = require('./utils/createFinalProjectStructure');
checkBrowsers(paths.appPath, isInteractive)
  .then(async () => {
    // // We attempt to use the default port but if it is busy, we offer the user to
    // // run on a different port. `choosePort()` Promise resolves to the next free port.
    // return choosePort(HOST, DEFAULT_PORT);
    await createFinalProjectStructure();
    const cdCommand = `cd ${paths.finalProjectDir}/`;
    execSync(`${cdCommand} && npm install`, { stdio: 'inherit' });

    // Start watcher, so we can copy src files to dev env
    const watcher = chokidar.watch(['src', 'public']);
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
