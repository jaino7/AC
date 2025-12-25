module.exports = {
  parserOptions: {
    project: "tsconfig.json",
    sourceType: "module"
  },
  extends: ["plugin:@typescript-eslint/recommended", "prettier"],
  plugins: ["@typescript-eslint"],
  root: true,
  env: {
    node: true,
    jest: false
  },
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }]
  }
};
