const fs = require('fs');
const { toCamel, parseObject } = require('./common');

function writeModelFile({ businessObject, boPath }) {
  const objectName = toCamel(businessObject.name);
  const filePath = boPath + '/model.js';
  if (fs.existsSync(filePath)) return;

  function createFieldRow(field) {
    let row = '    ' + toCamel(field.name) + ':';
    if (field.linkType) {
      row += ' new ';
      if (field.type === 'objects' || field.linkType === 'outer')
        row += 'RestifyForeignKeysArray(';
      if (
        field.linkType === 'inner' &&
        field.type !== 'generic' &&
        field.type !== 'objects'
      )
        row += 'RestifyForeignKey(';
      if (field.linkType === 'inner' && field.type === 'generic')
        row += 'RestifyGenericForeignKey(';
      if (field.linkMeta) row += "'" + toCamel(field.linkMeta) + "'";
      if (field.linkMetaList)
        row +=
          '[\n' +
          [
            ...new Set(
              field.linkMetaList.map((item) => "      '" + toCamel(item) + "'")
            ),
          ].join(',\n') +
          ',\n    ]';
      if (field.type === 'objects' || field.linkType === 'outer')
        row += ', { allowNested: false }';
      row += ')';
    } else {
      row += ' undefined';
    }
    row += ',';
    return row;
  }

  function generateModelFile(businessObject) {
    // TODO move loginc into one function
    const restifyImports = businessObject.fields.reduce((memo, field) => {
      if (field.type === 'objects' || field.linkType === 'outer')
        return { ...memo, ['RestifyForeignKeysArray']: true };
      if (
        field.linkType === 'inner' &&
        field.type !== 'generic' &&
        field.type !== 'objects'
      )
        return { ...memo, ['RestifyForeignKey']: true };

      if (field.linkType === 'inner' && field.type === 'generic')
        return { ...memo, ['RestifyGenericForeignKey']: true };
      return memo;
    }, {});
    const restifyImportsKey = Object.keys(restifyImports);
    const resifyImportRow =
      restifyImportsKey.length > 0
        ? `import { ${restifyImportsKey.join(', ')} } from 'redux-restify'\n`
        : '';
    const modelFile =
      resifyImportRow +
      "import { messages } from '$trood/mainConstants'\n" +
      'export default {\n' +
      '  defaults: {\n' +
      businessObject.fields.map((field) => createFieldRow(field)).join('\n') +
      '\n  },\n' +
      "  name: '" +
      objectName +
      "',\n" +
      '  deletion: {\n' +
      '    confirm: true,\n' +
      '    message: messages.deletionQuestion,\n' +
      '  },\n' +
      '  views: {\n' +
      Object.keys(businessObject.views)
        .map((key) => {
          return '    ' + key + ": '" + businessObject.views[key] + "',";
        })
        .join('\n') +
      '\n  },\n' +
      '  meta: [\n' +
      businessObject.fields.map(item=>{
        const objectMeta = {}
        Object.keys(item).forEach(key=>{
          if (['type', 'linkMeta', 'linkMetaList', 'linkType', 'optional'].some(targetFiled=>targetFiled===key)){
            objectMeta[key] = item[key]
          }
        })
        
        return parseObject(objectMeta, '    ')
      }).join(',\n') + ',\n' +
      '  ]\n' +
      '}';
    return modelFile;
  }

  fs.writeFileSync(filePath, generateModelFile(businessObject), 'utf-8');
  console.log(`Generating ${objectName}/model.js`);
}

module.exports = writeModelFile;
