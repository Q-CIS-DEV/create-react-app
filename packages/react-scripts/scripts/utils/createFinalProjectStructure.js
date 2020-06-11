const os = require('os');
const fs = require('fs-extra');
const path = require('path');

const paths = require('../../config/paths');

const gitCloneRepo = require('git-clone');

const copyAndMerge = require('./copyAndMerge');

const cssFileRegexp = /\.css$/;

const dependeciesOptions = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

const configFilesToCopy = [
  '.env',
  'package-lock.json',
  'yarn.lock',
  'public',
];

const configFoldersToCopy = [
  'src',
  'translate',
];

const copyProjectFiles = () => {
  // Copy config files
  configFilesToCopy.forEach(fileName => {
    if (fs.existsSync(fileName)) {
      const toPath = path.join(paths.finalProjectDir, fileName);
      fs.copySync(fileName, toPath);
    }
  });

  configFoldersToCopy.forEach(path => {
    const fromPath = `${path}/`;
    const toPath = `${paths.finalProjectDir}/${fromPath}`;
    fs.copySync(fromPath, toPath, {
      // We use filter function here to traverse directories, so we don't iterate 2 times
      // Merge css files, so we can extend styles
      filter: (src, dest) => {
        if (cssFileRegexp.test(src)) {
          copyAndMerge(src, dest);
          return false;
        }
        return true;
      },
    });
  })

  // Prepare package.json
  const appPackage = require(path.join(paths.appPath, 'package.json'));
  const finalProjectPackagePath = path.join(
    paths.finalProjectDir,
    'package.json'
  );
  const finalProjectPackage = require(finalProjectPackagePath);

  const finalPackage = dependeciesOptions.reduce(
    (memo, dependecy) => ({
      ...memo,
      [dependecy]: {
        ...finalProjectPackage[dependecy],
        ...appPackage[dependecy],
      },
    }),
    {
      ...finalProjectPackage,
      ...appPackage,
      scripts: finalProjectPackage.scripts,
    }
  );

  fs.writeFileSync(
    finalProjectPackagePath,
    JSON.stringify(finalPackage, null, 2) + os.EOL
  );

  fs.removeSync(path.join(paths.finalProjectDir, '.git'))
}

module.exports = () => {
  if (fs.existsSync(paths.finalProjectDir)) {
    copyProjectFiles();
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const clone = gitCloneRepo(
      'git@github.com:Q-CIS-DEV/trood-core-bundler-template.git',
      paths.finalProjectDir,
      {
        checkout: process.env.TROOD_CORE_VERSION,
      },
      () => {
        copyProjectFiles();
        resolve();
      },
    );
  });
};
