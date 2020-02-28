const fs = require('fs');
const { toCamel } = require('./common');

const generateProps = field => {
  const name = toCamel(field.name);
  return `value: model.${name},
          errors: modelErrors.${name},
          onChange: val => modelFormActions.changeField('${name}', val),
          onValid: () => modelFormActions.resetFieldError('${name}'),
          onInvalid: err => modelFormActions.setFieldError('${name}', err),
          validate: {
            checkOnBlur: true,
            required: ${!field.optional},
          },`;
};

function writeEditComponentFile({ businessObject, boPath }) {
  const objectName = toCamel(businessObject.name);
  const filePath = boPath + '/editComponent.js';
  // if (fs.existsSync(filePath)) return;

  const getImports = field => {
    if (field.type === 'number')
      return "import TInput, { INPUT_TYPES } from '$trood/components/TInput'";
    return null;
  };

  const getCode = field => {
    return null;
  };

  const getJsx = field => {
    if (field.type === 'number') {
      return `      <TInput
          {...{
          label: '${toCamel(field.name)}',
          placeholder: 'Not chosen',
          type: INPUT_TYPES.float,
          ${generateProps(field)}
        }}
      />`;
    }
    return field.name + '-' + field.type;
  };
  const generateEditComponent = businessObject => {
    const components = businessObject.fields.reduce(
      (memo, field) => {
        const imports = getImports(field);
        const code = getCode(field);
        const jsx = getJsx(field);
        return {
          imports: [...memo.imports, ...(imports ? [imports] : [])],
          code: [...memo.code, ...(code ? [code] : [])],
          jsx: [...memo.jsx, ...(jsx ? [jsx] : [])],
        };
      },
      {
        imports: [],
        code: [],
        jsx: [],
      }
    );

    return `import React from 'react';
${components.imports.join('\n')}

const EditComponent = ({ model, modelErrors, modelFormActions }) => {
${components.code.join('\n')}
  return (
    <React.Fragment>
${components.jsx.join('\n')}
    </React.Fragment>
  );
};
export default EditComponent`;
  };

  fs.writeFileSync(filePath, generateEditComponent(businessObject), 'utf-8');
  console.log(`Generating ${objectName}/editComponent.js`);
}

module.exports = writeEditComponentFile;
