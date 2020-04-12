const fs = require('fs');
const { toCamel } = require('./common');


function writeEditComponentFile({ businessObject, boPath }) {
  const objectName = toCamel(businessObject.name);
  const componentPath = boPath + '/editComponent.js';
  const cssPath = boPath + '/editComponent.css';
  if (fs.existsSync(componentPath)) return;

  const hasGeneric = businessObject.fields.some(
    field => field.type === 'generic' && field.linkType !== 'outer'
  )
  const hasSelect = hasGeneric || businessObject.fields.some(
    field => ['generic', 'array', 'object', 'objects'].includes(field.type) && field.linkType !== 'outer'
  )

  const getComponent = field => {
    const name = toCamel(field.name);

    if (field.type === 'bool') {
      return {
        jsx: `      <ModalComponents.ModalCheckbox
          {...{
            fieldName: '${name}',
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
        imports:"import { PICKER_TYPES } from '$trood/components/DateTimePicker'",
        jsx: `      <ModalComponents.ModalDateTimePicker
        {...{
          fieldName: '${name}',
          type: PICKER_TYPES.${
            field.type === 'datetime' ? 'dateTime' : field.type
          },
          validate: {
            checkOnBlur: true,${field.type === 'time' ? '' : `
            requiredDate: ${!field.optional},`}${field.type === 'date' ? '' : `
            requiredTime: ${!field.optional},`}
          },
        }}
      />`,
      };
    }

    if (['generic', 'array', 'object', 'objects'].includes(field.type)) {
      const generic = field.type === 'generic';
      const genericSpacing = generic ? '  ' : '';
      const multi = field.type !== 'object' && !generic;
      const linkName = field.linkMeta ? toCamel(field.linkMeta) : name;

      const props = [
        linkName + 'Entities',
        linkName + 'ApiActions',
        ...(generic ? ['...restProps'] : []),
      ];
      const imports = generic ? `import TSelect, { SELECT_TYPES } from '$trood/components/TSelect'
import { RESTIFY_CONFIG } from 'redux-restify'`: '';

      const entitiesNameConst = generic ? `  const ${linkName}ModelName = snakeToCamel(model.${name}._object)\n` : '';
      const entitiesConst = generic ? `  const ${linkName}GenericEnteties = restProps[${linkName}ModelName + 'Entities']\n` : '';
      
      const entities = generic
        ? `${linkName}GenericEnteties`
        : `${linkName}Entities`;
      const apiActions = generic
        ? `restProps[${linkName}ModelName + 'ApiActions']`
        : `${linkName}ApiActions`;

        

      const code = `${entitiesNameConst}${entitiesConst}  const [${linkName}Search, ${linkName}SearchSet] = useState('')
  const ${linkName}ModelConfig = RESTIFY_CONFIG.registeredModels${
        generic ? `[${linkName}ModelName]` : `.${linkName}`
      }
  const ${linkName}ApiConfig = {
    filter: {
      q: ${linkName}Search 
        ? \`eq(\${${linkName}ModelConfig.idField},\${${linkName}Search})\`
        : '',
      depth: 1,
    },
  }
  const ${linkName}Array = ${entities}.getArray(${linkName}ApiConfig)
  const ${linkName}ArrayIsLoading = ${entities}.getIsLoadingArray(
    ${linkName}ApiConfig,
  )
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

      const selectProps = `${genericSpacing}          items: ${linkName}Array.map(item => ({
${genericSpacing}            value: item[${linkName}ModelConfig.idField], 
${genericSpacing}            label: item.name || item[${linkName}ModelConfig.idField],
${genericSpacing}          })),
${genericSpacing}          onSearch: (value) => ${linkName}SearchSet(value ? encodeURIComponent(value) : ''),
${genericSpacing}          emptyItemsLabel: ${linkName}ArrayIsLoading ? '' : undefined,
${genericSpacing}          onScrollToEnd: ${linkName}NextPageAction,
${genericSpacing}          isLoading: ${linkName}ArrayIsLoading,${generic ? '' :`
${genericSpacing}          missingValueResolver: value => 
${genericSpacing}            ${entities}.getById(value)[${linkName}ModelConfig.idField],`}
${genericSpacing}          multi: ${multi},
${genericSpacing}          clearable: ${!field.optional},`;

      if (generic) {
        return {
          props,
          imports,
          code,
          jsx: `      <div className={style.row}>
          <TSelect 
          {...{
            className: undefined,
            label: '${name}_type',
            items: [
${field.linkMetaList
              .map(value => `              { value: '${value}' }`)
              .join(',\n')},
            ],
            type: SELECT_TYPES.filterDropdown,
            clearable: ${!field.optional},
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
        <ModalComponents.ModalSelect
          {...{
            fieldName: '${field.name}',
${selectProps}
${genericSpacing}          onChange: vals => modelFormActions.changeField(['${name}', ${linkName}ModelConfig.idField],
${genericSpacing}            ${multi ? 'vals' : 'vals[0]'},
${genericSpacing}          ),
${genericSpacing}          values: ${multi ? fieldValue : `${fieldValue} 
${genericSpacing}            ? [${fieldValue}] 
${genericSpacing}            : []`},
          }}
        />
      </div>`,
        };
      }

      return {
        props,
        imports,
        code: code,
        jsx: `      <ModalComponents.ModalSelect
        {...{
          fieldName: '${field.name}',
${selectProps}
        }}
      />`,
      };
    }

    return {
      imports: "import { INPUT_TYPES } from '$trood/components/TInput'",
      jsx: `      <ModalComponents.ModalInput
        {...{
          fieldName: '${field.name}',
          type: ${
            field.type === 'number' ? 'INPUT_TYPES.float' : 'INPUT_TYPES.multi'
          },
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
          !(field.name === toCamel(businessObject.key) && field.optional === true) &&
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
          props: ['model', 'modelErrors', 'modelFormActions', 'ModalComponents'],
        }
      );

    return `import React${hasSelect ? ', { useState }': ''} from 'react'
import style from './editComponent.css'
import modalsStyle from '$trood/styles/modals.css'
import classNames from 'classnames'
${[...new Set(components.imports)].join('\n')}
${
  hasGeneric
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
    <div className={classNames(style.root, modalsStyle.root)}>
${components.jsx.join('\n')}
    </div>
  )
}

export default EditComponent`;
  };

    
    const css= `.root {}
${hasGeneric ? `
.row {
  composes: root;
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
}

.row > * {
  width: calc(50% - 8px);
}
`:'' }`

  fs.writeFileSync(cssPath, css, 'utf-8');
  fs.writeFileSync(
    componentPath,
    generateEditComponent(businessObject),
    'utf-8'
  );

  console.log(`Generating ${objectName}/editComponent.js`);
}

module.exports = writeEditComponentFile;
