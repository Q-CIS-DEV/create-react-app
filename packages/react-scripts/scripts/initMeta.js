require('dotenv').config();
const getMeta = require('./initMetaUtils/getMeta');
const { ask, makeBoFolder, toCamel } = require('./initMetaUtils/common');
const writeModelFile = require('./initMetaUtils/writeModelFile.js');
const writeFormFile = require('./initMetaUtils/writeFormFile.js');
const writeIndexFile = require('./initMetaUtils/writeIndexFile.js');
const writeConfigFile = require('./initMetaUtils/writeConfigFile.js');
const writeBoConfigFile = require('./initMetaUtils/writeBoConfigFile.js');

// TODO add normal parsing for host
const url = (process.env.REACT_APP_DEFAULT_API_HOST || '').replace(
  '/custodian/data/',
  ''
);
const defaultBoCollectionName = 'TroodCoreBusinessObjects';
const appPath = process.cwd();

async function initMeta() {
  const meta = await getMeta(url);
  const boCollectionName =
    (await ask(
      `Business objects collection name (${defaultBoCollectionName})`
    )) || defaultBoCollectionName;
  const boCollectionPath = appPath + '/src/businessObjects/' + boCollectionName;
  makeBoFolder(boCollectionPath);
  writeConfigFile({ meta, appPath, boCollectionName });
  writeBoConfigFile({ meta, boCollectionPath, boCollectionName });
  meta.forEach(businessObject => {
    const objectName = toCamel(businessObject.name);
    const boPath = boCollectionPath + '/' + objectName;
    makeBoFolder(boPath);
    writeModelFile({ businessObject, boPath });
    writeFormFile({ businessObject, boPath });
    writeIndexFile({ businessObject, boPath });
  });
}

initMeta().catch(err => console.error(err));
