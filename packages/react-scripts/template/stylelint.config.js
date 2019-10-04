module.exports = {
  extends: 'stylelint-config-standard',
  ignoreFiles: './src/styles/variables.css',
  rules: {
    'selector-pseudo-element-colon-notation': 'single',
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: [
          'global',
        ],
      },
    ],
    'block-no-empty': null,
    'property-no-unknown': [
      true,
      {
        ignoreProperties: [
          'composes',
        ],
      },
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'global-import',
        ],
      },
    ],
    'declaration-empty-line-before': null,
    'custom-property-empty-line-before': null,
    'font-family-no-missing-generic-family-keyword': null,
  }
}
