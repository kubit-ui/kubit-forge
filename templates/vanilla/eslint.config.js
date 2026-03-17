const eslintConfigKubit = require('eslint-config-kubit');
const path = require('path');

module.exports = eslintConfigKubit({
  isReact: false,
  tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
});
