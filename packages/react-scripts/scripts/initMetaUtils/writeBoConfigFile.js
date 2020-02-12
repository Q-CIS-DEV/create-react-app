const fs = require('fs');
const { toCamel, parseObject } = require('./common');

function writeBoConfigFile({ meta, boCollectionPath, boCollectionName }) {
  const configPath = boCollectionPath + '/config.js';
  const defaultConfig = `{title: '${boCollectionName}', models: []}`;
  const configFile = fs.existsSync(configPath)
    ? fs.readFileSync(configPath, 'utf8') || defaultConfig
    : defaultConfig;
  // TODO refactor eval to es modules after move to node 13
  const boConfig = eval(
    '(' + configFile.replace('export default ', '').replace(';', '') + ')'
  );
  meta.forEach(businessObject => {
    const objectName = toCamel(businessObject.name);
    if (!boConfig.models.some(item => item.title === objectName)) {
      const dependsOn = businessObject.fields.reduce((memo, field) => {
        if (field.linkMeta) return [...memo, field.linkMeta];
        if (field.linkMetaList) return [...memo, ...field.linkMetaList];
        return memo;
      }, []);

      boConfig.models.push({
        title: objectName,
        ...(dependsOn.length > 0 && {
          dependsOn: [
            ...new Set(dependsOn.map(fieldName => toCamel(fieldName))),
          ],
        }),
      });
    }
  });
  fs.writeFileSync(
    configPath,
    `export default ${parseObject(boConfig)}`,
    'utf-8'
  );
}
module.exports = writeBoConfigFile;
