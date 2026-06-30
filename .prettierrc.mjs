/**
 * @type {import('prettier').Options}
 */
export default {
  printWidth: 80,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '<BUILTIN_MODULES>',
    '<THIRD_PARTY_MODULES>',
    '',
    '^@/(.*)$',
    '',
    '^~(.*)$',
    '',
    '^[./]',
  ],
  overrides: [
    {
      files: ['*.yaml', '*.yml'],
      options: {
        singleQuote: false,
      },
    },
  ],
};
