module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    'browser': true,
    'es6': true,
    'jest/globals': true,
  },
  plugins: [
    'jest',
    'immutablejs',
    '@typescript-eslint',
  ],
  extends: [
    'airbnb',
    'plugin:jest/recommended',
    // 'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: 'babel-eslint',
  rules: {
    'semi': [2, 'never'],
    'func-names': ['error', 'never'],
    'consistent-return': 'off',
    'no-restricted-syntax': 0,
    'immutablejs/no-native-map-set': 2,
    'react/jsx-filename-extension': 0,
    'react/prop-types': 0,
    'import/no-extraneous-dependencies': [
      'error',
      {
        'devDependencies': ['**/*.test.js', '**/*.story.js']
      }
    ],
  },
};
