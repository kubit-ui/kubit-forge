const eslintConfigKubit = require('eslint-config-kubit');
const path = require('path');

module.exports = eslintConfigKubit({
  isReact: true,
  tsConfigPath: path.resolve(__dirname, './tsconfig.json'),
});
