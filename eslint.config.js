import perfectonist from "eslint-plugin-perfectionist";
import tseslint from "typescript-eslint";

export default tseslint.config({
  plugins: {
    perfectonist,
  },
  rules: {
    "perfectonist/sort-imports": "error",
  },
});
