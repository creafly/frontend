module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "no-unused-vars": "off",
    "no-warning-comments": ["error", { terms: ["todo", "fixme"], location: "anywhere" }],
    "spaced-comment": [
      "error",
      "always",
      {
        line: {
          markers: ["/"],
        },
        block: {
          markers: ["*"],
          balanced: true,
        },
      },
    ],
    "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 0 }],
  },
};
