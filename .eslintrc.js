// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'script'
  },
  env: {
    browser: true,
    es6: true,
    jquery: true
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  globals: {
    'gVar': true
  },
  // add your custom rules here
  'rules': {
    // allow [iI]gnored pattern variables can be unused
    'no-unused-vars': [2, {'vars': 'all', 'args': 'none', 'varsIgnorePattern': '[iI]gnored'}],
    // only multi-line tailing comma allows in obj, arr etc.
    'comma-dangle': ['error', 'only-multiline'],
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
