const fs = require('fs');
const { toCamel } = require('./common');

function writeEditComponentFile({ businessObject, boPath }) {
  const objectName = toCamel(businessObject.name);
  const filePath = boPath + '/editComponent.js';
  // if (fs.existsSync(filePath)) return;
    const generateField = (field) =>{
        return field.name + field.type
    }
  const generateEditComponent = (businessObject)=>{
    const editComponent = "import React from 'react'\n" +
    "const EditComponent = () => {\n" +
    "  return <div>" + businessObject.fields.map(field => generateField(field)).join("\n") + "</div>\n" + 
    "}\n"+
    "export default EditComponent"
    return editComponent
  }

  fs.writeFileSync(filePath, generateEditComponent(businessObject), 'utf-8');
  console.log(`Generating ${objectName}/editComponent.js`);
}

module.exports = writeEditComponentFile;
