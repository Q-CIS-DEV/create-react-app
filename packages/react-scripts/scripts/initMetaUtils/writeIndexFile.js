const fs = require("fs");
const { toCamel } = require("./common");

function writeIndexFile({ businessObject, boPath }) {
  const exportRegExp = /export default\s{(?:.|\n)*}/gi;
  const objectName = toCamel(businessObject.name);
  const filePath = boPath + "/index.js";
  const defaultExport = "\nexport default {}";
  let indexFile = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8") || defaultExport
    : defaultExport;
  if (!exportRegExp.test(indexFile)) indexFile += defaultExport;
  let exportObject = indexFile
    .match(exportRegExp)[0]
    .replace("export default {", "")
    .slice(0, -1);

  if (!/model(,|:)/.test(exportObject))
    exportObject += `${exportObject.endsWith("\n") ? "" : "\n"}  model,\n`;
  if (!/form(,|:)/.test(exportObject))
    exportObject += `${exportObject.endsWith("\n") ? "" : "\n"}  form,\n`;

  indexFile = indexFile.replace(
    exportRegExp,
    "export default {" + exportObject + "}"
  );
  if (!/import model /.test(indexFile))
    indexFile = "import model from './model';\n" + indexFile;
  if (!/import form /.test(indexFile))
    indexFile = "import form from './form';\n" + indexFile;

  fs.writeFileSync(filePath, indexFile, "utf-8");
  console.log(`Generating ${objectName}/index.js`);
}
module.exports = writeIndexFile;
