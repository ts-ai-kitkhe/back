module.exports = {
  root: true,
  env: {
    browser: false,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
  },
  extends: ["prettier"],
  plugins: [],
  // add your custom rules here
  rules: {},
};
