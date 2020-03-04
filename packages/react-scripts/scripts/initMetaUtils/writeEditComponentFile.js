const fs = require('fs');
const { toCamel } = require('./common');

const getDefaultProps = field => {
  const name = toCamel(field.name);
  return `label: '${name}',
          placeholder: 'Not chosen',
          value: model.${name},
          errors: modelErrors.${name},
          onChange: val => modelFormActions.changeField('${name}', val),
          onValid: () => modelFormActions.resetFieldError('${name}'),
          onInvalid: err => modelFormActions.setFieldError('${name}', err),`;
};

function writeEditComponentFile({ businessObject, boPath }) {
  const objectName = toCamel(businessObject.name);
  const filePath = boPath + '/editComponent.js';
  // if (fs.existsSync(filePath)) return;

  const getComponent = field => {
    const name = toCamel(field.name);

    if (field.type === 'bool') {
      return {
        imports: "import TCheckbox from '$trood/components/TCheckbox'",
        jsx: `      <TCheckbox
            {...{
            ${getDefaultProps(field)}
            validate: {
              checkOnBlur: true,
              required: ${!field.optional},
            },
          }}
        />`,
      };
    }

    if (field.type === 'datetime') {
      return {
        imports:
          "import DateTimePicker from '$trood/components/DateTimePicker'",
        jsx: `      <DateTimePicker
            {...{
            ${getDefaultProps(field)}
            validate: {
              checkOnBlur: true,
              requiredDate: ${!field.optional},
              requiredTime: ${!field.optional},
            },
          }}
        />`,
      };
    }

   
    if (['generic', 'array', 'object', 'objects'].includes(field.type)) {
      const linkName = field.linkMeta ? toCamel(field.linkMeta) : '';
      const props = [linkName + 'Entities', linkName + 'ApiActions'];
      const imports = `import TSelect, { SELECT_TYPES } from '$trood/components/TSelect'
import { getNestedObjectField } from '$trood/helpers/nestedObjects'
import { RESTIFY_CONFIG } from 'redux-restify'`;

      const getSelectProps = (multi, generic) => {
        let forEntityProps = '';
        const code = `      const [${linkName}Search, ${linkName}SearchSet] = React.useState('')
      const ${linkName}ModelConfig = RESTIFY_CONFIG.registeredModels[${
          generic ? `model.${linkName}._object` : `'${linkName}'`
        }]
      const ${linkName}ApiConfig = {
        filter: {
          q: ${linkName}Search ? \`eq(\${${linkName}ModelConfig.idField},\${${linkName}Search})\` : '',
          only: ${linkName}ModelConfig.idField,
          depth: 1,
        },
      }
      const ${linkName}Array = ${linkName}Entities.getArray(${linkName}ApiConfig)
      const ${linkName}ArrayIsLoading = ${linkName}Entities.getIsLoadingArray(${linkName}ApiConfig)
      const ${linkName}NextPage = ${linkName}Entities.getNextPage(${linkName}ApiConfig)
      const ${linkName}NextPageAction = () => {
        if (${linkName}NextPage) {
          ${linkName}ApiActions.loadNextPage(${linkName}ApiConfig)
        }
      }
      `;
        const fieldValue = generic
          ? `model.${name}[${linkName}ModelConfig.idField] `
          : `model.${name}`;

        forEntityProps = `
        items: ${linkName}Array.map(item => ({ value: item[${linkName}ModelConfig.idField] })),
        values: ${multi ? fieldValue : `${fieldValue} ? [${fieldValue}] : []`},
        onChange: vals => modelFormActions.changeField(${
          generic ? `['${name}', ${linkName}ModelConfig.idField]` : `'${name}'`
        },
          ${multi ? 'vals' : 'vals[0]'},
        ),
        onSearch: (value) => ${linkName}SearchSet(value ? encodeURIComponent(value) : ''),
        emptyItemsLabel: ${linkName}ArrayIsLoading ? '' : undefined,
        onScrollToEnd: ${linkName}NextPageAction,
        isLoading: ${linkName}ArrayIsLoading,
        missingValueResolver: value => ${linkName}Entities.getById(value).name,`;

        return {
          code,
          componentProps: `
          ${forEntityProps}
          label: '${name}',
          errors: modelErrors.${name},
          onValid: () => modelFormActions.resetFieldError('${name}'),
          onInvalid: err => modelFormActions.setFieldError('${name}', err),
          type: SELECT_TYPES.filterDropdown,
          multi: ${multi},
          clearable: ${!field.optional},
          placeHolder: 'Not set',
          `,
        };
      };

      if (field.type === 'generic') {
        const componentConfig = getSelectProps(false, true);
        return {
          props,
          imports,
          code: componentConfig.code,
          jsx: `<div>
          <TSelect
            {...{
              ${componentConfig.componentProps}
            }}
          />
        </div>`,
        };
      }

      const multi = field.type !== 'object';
      const componentConfig = getSelectProps(multi, false);
      return {
        props,
        imports,
        code: componentConfig.code,
        jsx: `<TSelect
        {...{
          ${componentConfig.componentProps}
        }}
      />`,
      };
    }

    return {
      imports: "import TInput, { INPUT_TYPES } from '$trood/components/TInput'",
      jsx: `      <TInput
          {...{
          type: ${
            field.type === 'number' ? 'INPUT_TYPES.float' : 'INPUT_TYPES.multi'
          },
          ${getDefaultProps(field)}
          validate: {
            checkOnBlur: true,
            required: ${!field.optional},
          },
        }}
      />`,
    };
  };

  const generateEditComponent = businessObject => {
    const components = businessObject.fields
      .filter(field => !['id', 'created'].includes(field.name) && field.linkType === 'outer')
      .reduce(
        (memo, field) => {
          const component = getComponent(field);
          return {
            imports: [
              ...memo.imports,
              ...(component.imports ? [component.imports] : []),
            ],
            code: [...memo.code, ...(component.code ? [component.code] : [])],
            jsx: [...memo.jsx, ...(component.jsx ? [component.jsx] : [])],
            props: [...memo.props, ...(component.props ? component.props : [])],
          };
        },
        {
          imports: [],
          code: [],
          jsx: [],
          props: ['model', 'modelErrors', 'modelFormActions'],
        }
      );

    return `import React from 'react'
${[...new Set(components.imports)].join('\n')}

const EditComponent = ({
  ${[...new Set(components.props)].join(',\n  ')}, 
}) => {
${[...new Set(components.code)].join('\n')}
  return (
    <React.Fragment>
${components.jsx.join('\n')}
    </React.Fragment>
  )
}
export default EditComponent`;
  };

  fs.writeFileSync(filePath, generateEditComponent(businessObject), 'utf-8');
  console.log(`Generating ${objectName}/editComponent.js`);
}

module.exports = writeEditComponentFile;
