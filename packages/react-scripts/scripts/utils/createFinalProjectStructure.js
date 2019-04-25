const os = require('os');
const fs = require('fs-extra');
const path = require('path');

const paths = require('../../config/paths');

const gitCloneRepo = require('git-clone');

const copyAndMerge = require('./copyAndMerge');

const cssFileRegexp = /\.css$/;

// const libraries = ['businessObjects', 'componentLibraries'];
const dependeciesOptions = [
  'dependencies',
  'devDependencies',
  'optionalDependencies',
  'peerDependencies',
];

configFilesToCopy = [
  // 'src/config.js',
  '.env',
  'package-lock.json',
  'yarn.lock',
  'public',
];

module.exports = () => {
  return new Promise((resolve, reject) => {
    const clone = gitCloneRepo(
      'git@github.com:Q-CIS-DEV/trood-core-bundler-template.git',
      paths.finalProjectDir,
      {
        checkout: process.env.TROOD_CORE_VERSION,
      },
      () => {
        // Copy config files
        configFilesToCopy.forEach(fileName => {
          if (fs.existsSync(fileName)) {
            const toPath = path.join(paths.finalProjectDir, fileName);
            fs.copySync(fileName, toPath);
          }
        });

        // Copy src
        const dirFromPath = `src/`;
        const dirToPath = `${paths.finalProjectDir}/src/`;
        fs.copySync(dirFromPath, dirToPath, {
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

        // Copy libraries
        /*
        libraries.forEach(library => {
          const dirFromPath = `src/${library}`
          const dirToPath = `${paths.finalProjectDir}/src/${library}`
          const files = fs.readdirSync(dirFromPath)

          files.forEach(file => {
            const fileFromPath = path.join(dirFromPath, file)
            const fileToPath = path.join(dirToPath, file)
            const stats = fs.statSync(fileFromPath);
            if (stats.isDirectory()) {
              fs.copySync(fileFromPath, fileToPath);
            }
          });
        });
        */

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

        resolve();
      }
    );
  });
};
