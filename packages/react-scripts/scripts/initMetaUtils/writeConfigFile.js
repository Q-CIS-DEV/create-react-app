const fs = require("fs");
const util = require("util");
const { toCamel } = require("./common");

function writeConfigFile({ meta, appPath, boCollectionName }) {
  const configPath = appPath + "/src/config.js";
  const configFile = fs.readFileSync(configPath, "utf8");
  // TODO refactor eval to es modules after move to node 13
  const appConfig = eval(
    "(" + configFile.replace("export default ", "").replace(";", "") + ")"
  );
  let targetBoCollectionIndex = appConfig.businessObjects.findIndex(
    ({ name }) => name === boCollectionName
  );
  if (targetBoCollectionIndex === -1) {
    appConfig.businessObjects.push({
      name: boCollectionName,
      type: "CUSTODIAN",
      models: {}
    });
    targetBoCollectionIndex = appConfig.businessObjects.length - 1;
  }

  const boCollection = appConfig.businessObjects[targetBoCollectionIndex];

  meta.forEach(businessObject => {
    const objectName = toCamel(businessObject.name);
    if (!boCollection.models[objectName]) {
      boCollection.models[objectName] = { endpoint: businessObject.name };
    }
  });

  fs.writeFileSync(
    configPath,
    `export default ${util.inspect(appConfig, {
      depth: null,
      breakLength: 1
    })}`,
    "utf-8"
  );
  console.log(`Generating src/config.js`);
}
module.exports = writeConfigFile;
