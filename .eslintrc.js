'use strict';

module.exports = {
  'parserOptions': {
    'ecmaVersion': 5,
    'sourceType': 'module',
    'ecmaFeatures': {
      'globalReturn': true,
      'impliedStrict': false,
      'jsx': false,
      'experimentalObjectRestSpread': false
    }
  },
  'env': {
    'node': true,
    'es6': true
  },
  'extends': [
    'eslint:recommended',
    'stzhang/eslint-config-bestpractice.js',
    'stzhang/eslint-config-errors.js',
    'stzhang/eslint-config-es6.js',
    'stzhang/eslint-config-node.js',
    'stzhang/eslint-config-possibleerrors.js',
    'stzhang/eslint-config-stylistic.js',
    'stzhang/eslint-config-var.js'
  ],
  'rules': {
    'stzhang/no-string-charcode': 'off',
    'indent': ['error', 4, {
      'SwitchCase': 0,
      'VariableDeclarator': {
        'var': 2,
        'let': 2,
        'const': 3
      }
    }],
    'no-console': ['error', {
      'allow': ['error', 'assert']
    }]
  },
  'parser': 'babel-eslint',
  'root': true
};
