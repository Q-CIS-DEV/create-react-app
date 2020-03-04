const fs = require('fs');
const { toCamel } = require('./common');

const getDefaultProps = field => {
  const name = toCamel(field.name);
  return `label: '${name}',
            className: modalsStyle.control,
            value: model.${name},
            errors: modelErrors.${name},
            onChange: val => modelFormActions.changeField('${name}', val),
            onValid: () => modelFormActions.resetFieldError('${name}'),
            onInvalid: err => modelFormActions.setFieldError('${name}', err),`;
};

function writeEditComponentFile({ businessObject, boPath }) {
  const objectName = toCamel(businessObject.name);
  const componentPath = boPath + '/editComponent.js';
  const cssPath = boPath + '/editComponent.css';
  // if (fs.existsSync(componentPath)) return;

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

    if (['date', 'time', 'datetime'].includes(field.type)) {
      return {
        imports:"import DateTimePicker, { PICKER_TYPES } from '$trood/components/DateTimePicker'",
        jsx: `      <DateTimePicker
            {...{
              ${getDefaultProps(field)}
              type: PICKER_TYPES.${
                field.type === 'datetime' ? 'dateTime' : field.type
              },
              validate: {
                checkOnBlur: true,
  ${field.type === 'time' ? '' : `              requiredDate: ${!field.optional},`}
  ${field.type === 'date' ? '' : `              requiredTime: ${!field.optional},`}
            },
          }}
        />`,
      };
    }

    if (['generic', 'array', 'object', 'objects'].includes(field.type)) {
      const generic = field.type === 'generic';
      const multi = field.type !== 'object' && !generic;
      const linkName = field.linkMeta ? toCamel(field.linkMeta) : name;

      const props = [
        linkName + 'Entities',
        linkName + 'ApiActions',
        ...(generic ? ['...restProps'] : []),
      ];
      const imports = `import TSelect, { SELECT_TYPES } from '$trood/components/TSelect'
import { RESTIFY_CONFIG } from 'redux-restify'`;

      const targetFieldName = `snakeToCamel(model.${name}._object)`;
      const entities = generic
        ? `restProps[${targetFieldName} + 'Entities']`
        : `${linkName}Entities`;
      const apiActions = generic
        ? `restProps[${targetFieldName} + 'ApiActions']`
        : `${linkName}ApiActions`;

      const code = `  const [${linkName}Search, ${linkName}SearchSet] = React.useState('')
  const ${linkName}ModelConfig = RESTIFY_CONFIG.registeredModels${
        generic ? `[${targetFieldName}]` : `.${linkName}`
      }
  const ${linkName}ApiConfig = {
    filter: {
      q: ${linkName}Search ? \`eq(\${${linkName}ModelConfig.idField},\${${linkName}Search})\` : '',
      depth: 1,
    },
  }
  const ${linkName}Array = ${entities}.getArray(${linkName}ApiConfig)
  const ${linkName}ArrayIsLoading = ${entities}.getIsLoadingArray(${linkName}ApiConfig)
  const ${linkName}NextPage = ${entities}.getNextPage(${linkName}ApiConfig)
  const ${linkName}NextPageAction = () => {
    if (${linkName}NextPage) {
      ${apiActions}.loadNextPage(${linkName}ApiConfig)
    }
  }
      `;

      const fieldValue = generic
        ? `model.${name}[${linkName}ModelConfig.idField] `
        : `model.${name}`;

      const componentProps = `items: ${linkName}Array.map(item => ({ value: item[${linkName}ModelConfig.idField], label: item.name || item[${linkName}ModelConfig.idField] })),
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
          missingValueResolver: value => ${entities}.getById(value)[${
          generic ? `${linkName}ModelConfig.idField` : `'${name}'`
        }],
          label: '${name}',
          errors: modelErrors.${name},
          onValid: () => modelFormActions.resetFieldError('${name}'),
          onInvalid: err => modelFormActions.setFieldError('${name}', err),
          type: SELECT_TYPES.filterDropdown,
          multi: ${multi},
          clearable: ${!field.optional},
          placeHolder: 'Not set',`;

      if (generic) {
        return {
          props,
          imports,
          code,
          jsx: `<div className={modalsStyle.control}>
          <TSelect 
            {...{
              className: undefined,
              label: '${name}_type',
              items: [${field.linkMetaList
                .map(value => `{ value: '${value}' }`)
                .join(', ')}],
              type: SELECT_TYPES.filterDropdown,
              clearable: true,
              values: model.${name} && model.${name}._object ? [model.${name}._object] : [],
              placeHolder: 'Not set',
              onChange: vals => modelFormActions.changeField('${name}', { _object: vals[0] }),
              onInvalid: err => modelFormActions.setFieldError('${name}', err),
              validate: {
                checkOnBlur: true,
                required: ${!field.optional},
              },
            }} 
          />
          <TSelect
            {...{
        ${componentProps}
            }}
          />
        </div>`,
        };
      }

      return {
        props,
        imports,
        code: code,
        jsx: `      <TSelect
        {...{
          className: modalsStyle.control,
          ${componentProps}
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
      .filter(
        field =>
          !(field.name === 'id' && field.optional === true) &&
          field.linkType !== 'outer'
      )
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
import style from './editComponent.css'
import modalsStyle from '$trood/styles/modals.css'
import classNames from 'classnames'
${[...new Set(components.imports)].join('\n')}
${
  businessObject.fields.some(
    field => field.type === 'generic' && field.linkType !== 'outer'
  )
    ? "import { snakeToCamel } from '$trood/helpers/namingNotation'"
    : ''
}

const EditComponent = ({
  ${[...new Set(components.props)]
    .sort(a => (a === '...restProps' ? 1 : -1))
    .join(',\n  ')}${components.props.includes('...restProps') ? '' : ','} 
}) => {
${[...new Set(components.code)].join('\n')}
  return (
    <div {...{className: classNames(style.root, modalsStyle.root)}}>
${components.jsx.join('\n')}
    </div>
  )
}
export default EditComponent`;
  };

  fs.writeFileSync(cssPath, '.root {}', 'utf-8');
  fs.writeFileSync(
    componentPath,
    generateEditComponent(businessObject),
    'utf-8'
  );

  console.log(`Generating ${objectName}/editComponent.js`);
}

module.exports = writeEditComponentFile;
