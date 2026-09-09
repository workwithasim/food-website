import baseConfig from "@restaurant/config/eslint.config.mjs";

export default [
  ...baseConfig,
  {
    ignores: ["dist/**", "node_modules/**"]
  }
];
