const fs = require("fs");
const util = require("util");
const { toCamel, toName } = require("./common");

function writeEntityNameMessages({ meta, appPath }) {
  const exportRegExp = /\({(?:.|\n)*}\)/gi;
  const filePath = appPath + "/src/entityNameMessages.js";
  const defaultExport =
    "import { defineMessages } from 'react-intl';\n\n" +
    "export default defineMessages({})";
  const entityNameMessagesFile = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8") || defaultExport
    : defaultExport;

  const entityNameMessages = eval(
    entityNameMessagesFile.match(exportRegExp)[0]
  );
  meta.forEach(businessObject => {
    const objectName = toCamel(businessObject.name);
    if (!entityNameMessages[objectName]) {
      entityNameMessages[objectName] = {
        id: `entityNameMessages.${objectName}`,
        defaultMessage: toName(businessObject.name)
      };
    }
  });

  fs.writeFileSync(
    filePath,
    entityNameMessagesFile.replace(
      exportRegExp,
      "(" +
        util.inspect(entityNameMessages, { depth: null, breakLength: 1 }) +
        ")"
    ),
    "utf-8"
  );
  console.log(`Generating src/entityNameMessages.js`);
}
module.exports = writeEntityNameMessages;
