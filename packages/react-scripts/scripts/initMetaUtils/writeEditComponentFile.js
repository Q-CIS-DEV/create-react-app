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

    // if (['generic', 'array', 'object', 'objects'].includes(field.type)) {
      if (['object'].includes(field.type)) {
      const linkName = toCamel(field.linkMeta);
      const props = [linkName +'Entities', linkName + 'ApiActions']
      const code = `      const [${linkName}Search, ${linkName}SearchSet] = React.useState('')
      const ${linkName}ApiConfig = {
        filter: {
          q: ${linkName}Search ? 'like(name,*' + ${linkName}Search + ')' : '',
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
      `

      const imports = `import TSelect, { SELECT_TYPES } from '$trood/components/TSelect'
import { getNestedObjectField } from '$trood/helpers/nestedObjects'`

      let jsx = '';

      if (field.type === 'generic') {
        jsx = `      <div>
            <TSelect {...{
              label: '${name}_type',
              items: fieldMeta.linkMetaList.map(value => ({ value })),
              type: SELECT_TYPES.filterDropdown,
              clearable: true,
              values: model.${name} && model.${name}._object ? [model.${name}._object] : [],
              placeHolder: 'Not set',
              onChange: values => modelFormActions.changeField('${name}', values[0]),
              onInvalid: errs => modelFormActions.setFieldError('${name}', errs),
              validate: {
                checkOnBlur: true,
                required: ${!field.optional},
              },
            }} />
            <TSelect {...{
              ...getSelectProps(
                model[fieldMeta.name] ? getBusinessObjectRestifyModelName(model[fieldMeta.name]._object) : undefined,
                false,
                true,
              ),
            }} />
          </div>
        `
      }
      
      if (fieldMeta.type === 'object') {
        jsx = `      <TSelect
        {...{
          label: '${name}',
          items: ${linkName}Array.map(e => ({ value: e.id, label: e.name })),
          type: SELECT_TYPES.filterDropdown,
          placeholder: 'Not chosen',
          values: model.${name} && [model.${name}],
          onChange: values => modelFormActions.changeField('${name}', values[0]),
          onInvalid: errs => modelFormActions.setFieldError('${name}', errs),
          onValid: () => modelFormActions.resetFieldError('${name}'),
          errors: getNestedObjectField(modelErrors, '${name}'),
          validate: {
            required: ${!field.optional},
            checkOnBlur: true,
          },
          onSearch: (value) => ${linkName}SearchSet(value ? encodeURIComponent(value) : ''),
          emptyItemsLabel: ${linkName}ArrayIsLoading ? '' : undefined,
          onScrollToEnd: ${linkName}NextPageAction,
          missingValueResolver: value => ${linkName}Entities.getById(value).name,
          isLoading: ${linkName}ArrayIsLoading,
        }}
      />`
      return {imports, code, jsx, props};
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
    const components = businessObject.fields.filter(field=>!['id', 'created'].includes(field.name)).reduce(
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
