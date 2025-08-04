import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      // Disable apostrophe escaping rule
      "react/no-unescaped-entities": "off",

      // Disable the <a> instead of <Link> rule
      "jsx-a11y/anchor-is-valid": "off",
      "next/link-passhref": "off", // if you also get passHref errors
    },
  },
];

export default eslintConfig;
