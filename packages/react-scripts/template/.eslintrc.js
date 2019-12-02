module.exports = {
  parser: 'babel-eslint',
  extends: ['react-app', 'plugin:jsx-a11y/recommended'],
  env: {
    jasmine: true,
  },
  rules: {
    // May be enable in future
    'jsx-a11y/click-events-have-key-events': 0,
    'jsx-a11y/no-static-element-interactions': 0,
    'jsx-a11y/no-noninteractive-tabindex': 0,
  },
}
