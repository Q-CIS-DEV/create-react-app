module.exports = {
  parser: 'babel-eslint',
  extends: 'airbnb',
  env: {
    browser: true,
    jasmine: true,
  },
  rules: {
    'arrow-body-style': 0,
    'global-require': 0,
    'import/no-unresolved': 0,
    'no-empty-pattern': 1,
    'no-extra-parens': 0,
    'no-unused-vars': 1,
    'no-console': 0,
    'linebreak-style': 0,
    'arrow-parens': 0,
    'no-mixed-operators': 0,
    'max-len': [
      'error',
      {
        code: 120,
      }
    ],
    semi: [
      'error',
      'never',
    ],

    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/label-has-for': 0,
    // Inapropriate behavior for object-like props
    'jsx-a11y/img-has-alt': 0,
    // May be enable in future
    'jsx-a11y/click-events-have-key-events': 0,

    'react/prop-types': 0,
    'react/jsx-first-prop-new-line': 0,
    'react/jsx-closing-bracket-location': 0,
    'react/jsx-max-props-per-line': 0,
    'react/no-array-index-key': 0,
    'react/no-unused-prop-types': 0,
    'react/self-closing-comp': 0,
    'react/no-did-mount-set-state': 0,
    // TODO by @deylak make sence to migrate to .jsx file extensions, but it's a low priority
    'react/jsx-filename-extension': 0,
    // TODO by @deylak maybe some day add 'object' here, as it is in defaults.
    // But now it's to complex to implement models validators(also data can vary from backend)
    // As a compromise, custom heuristic model validator can be implemented
    'react/forbid-prop-types': [
      'error',
      {
        forbid: ['any', 'array'],
      },
    ],
    // TODO by @deylak seems usefull, but has migration issue with many unnecessary props(undefined as default)
    'react/require-default-props': 0,

    'import/extensions': 0,
    'import/prefer-default-export': 0,
    'import/first': 0,
    // TODO by @deylak find out whats wrong with imports like `import api from 'api'`
    'import/no-extraneous-dependencies': 0,
    // TODO by @deylak now quite, what we need, it reacts to require(), that doesn't seem to need new line after it
    'import/newline-after-import': 0,
    // We have some conventions in api and other libraries, but we should not use underscore convetion as a rule
    'no-underscore-dangle': 0,
    // Doesn't really working with query builder calls, makes it much worse
    'function-paren-newline': 0,
    'prefer-destructuring': [
      'error', {
        'VariableDeclarator': {
          'array': false,
          'object': true,
        },
        'AssignmentExpression': {
          'array': false,
          'object': false,
        },
      },
      {
        'enforceForRenamedProperties': false,
      },
    ],
    'no-param-reassign': [
      'error',
      {
        'props': true,
        'ignorePropertyModificationsFor': ['memo', 'result'],
      },
    ],
    'jsx-a11y/anchor-is-valid': [
      'error',
      {
        'components': ['Link'],
        'specialLink': ['to'],
        'aspects': ['noHref', 'invalidHref', 'preferButton'],
      },
    ],
  },
}
