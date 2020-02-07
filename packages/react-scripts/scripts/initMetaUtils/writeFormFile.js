const fs = require("fs");
const { toCamel } = require("./common");

function writeFormFile({ businessObject, boPath }) {
  const objectName = toCamel(businessObject.name);
  const filePath = boPath + "/form.js";
  if (fs.existsSync(filePath)) return;

  function createFieldRow(field) {
    let row = "    " + toCamel(field.name) + ": ";
    if (field.linkType === "outer") {
      row += "[]";
    } else {
      row += "undefined";
    }
    row += ",";
    return row;
  }

  function generateFormFile(businessObject) {
    const formFile =
      "export default {\n" +
      "  defaults: {\n" +
      businessObject.fields.map(field => createFieldRow(field)).join("\n") +
      "\n  },\n" +
      "  mapServerDataToIds: true,\n" +
      "};";
    return formFile;
  }

  fs.writeFileSync(filePath, generateFormFile(businessObject), "utf-8");
  console.log(`Generating ${objectName}/form.js`);
}
module.exports = writeFormFile;
