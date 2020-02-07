const fs = require("fs");
const { toCamel } = require("./common");

function writeModelFile({ businessObject, boPath }) {
  const objectName = toCamel(businessObject.name);
  const filePath = boPath + "/model.js";
  if (fs.existsSync(filePath)) return;

  function createFieldRow(field) {
    let row = "    " + toCamel(field.name) + ":";
    if (field.linkType) {
      row += " new ";
      if (field.linkType === "outer") row += "RestifyForeignKeysArray(";
      if (field.linkType === "inner") row += "RestifyForeignKey(";
      if (field.linkMeta) row += "'" + toCamel(field.linkMeta) + "'";
      if (field.linkMetaList)
        row +=
          "[" +
          field.linkMetaList.map(item => "'" + toCamel(item) + "'").join(", ") +
          "]";
      row += ")";
    } else {
      row += " undefined";
    }
    row += ",";
    return row;
  }

  function generateModelFile(businessObject) {
    const isForeignKeyExists = businessObject.fields.some(
      field => field.linkType && field.linkType === "inner"
    );
    const isForeignKeyArrayExists = businessObject.fields.some(
      field => field.linkType && field.linkType === "outer"
    );
    const resifyImportRow = `import { ${
      isForeignKeyExists ? "RestifyForeignKey" : ""
    }${isForeignKeyExists && isForeignKeyArrayExists ? ", " : ""}${
      isForeignKeyArrayExists ? "RestifyForeignKeysArray" : ""
    } } from 'redux-restify';`;
    const modelFile =
      resifyImportRow +
      "\n" +
      "import globalMessages from '$trood/globalMessages';\n" +
      "import entityNameMessages from '$trood/entityNameMessages';\n\n" +
      "export default {\n" +
      "  defaults: {\n" +
      businessObject.fields.map(field => createFieldRow(field)).join("\n") +
      "\n  },\n" +
      "  name: entityNameMessages." +
      objectName +
      ",\n" +
      "  deletion: {\n" +
      "    confirm: true,\n" +
      "    message: globalMessages.deletionQuestion,\n" +
      "  },\n" +
      "};";
    return modelFile;
  }

  fs.writeFileSync(filePath, generateModelFile(businessObject), "utf-8");
  console.log(`Generating ${objectName}/model.js`);
}

module.exports = writeModelFile;
