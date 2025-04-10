/**
 * @see https://prettier.io/docs/en/configuration.html
 * @type {import("prettier").Config}
 */
const config = {
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  importOrder: [
    "<TYPES>",
    "^(react|next|payload)(/.+)?$",
    "<THIRD_PARTY_MODULES>",
    "",
    "<TYPES>^(@/)",
    "^@/(.*)$",
    "",
    "<TYPES>^[./]",
    "^[./]",
  ],
  importOrderTypeScriptVersion: "5.7.2",
  importOrderParserPlugins: ["typescript", '["decorators", { "decoratorsBeforeExport": true }]'],
  trailingComma: "all",
  semi: true,
  tabWidth: 2,
  singleQuote: false,
};

export default config;
