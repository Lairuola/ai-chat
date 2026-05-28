import antfu from '@antfu/eslint-config'

export default antfu({
  react: true,
  typescript: true,
  stylistic: {
    indent: 2,
    quotes: 'single',
    semi: false,
  },
  rules: {
    'style/max-statements-per-line': 'off',
    'style/multiline-ternary': 'off',
    'react-dom/no-missing-button-type': 'off',
    'test/prefer-lowercase-title': 'off',
  },
  ignores: ['stats.json'],
})
