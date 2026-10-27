// ESLint flat config for the DTI Angular frontend.
// Official angular-eslint recommended sets (TypeScript + templates +
// template accessibility) plus a small number of project-specific rules.
// Type-aware typescript-eslint sets are intentionally NOT used: this project
// uses TypeScript project references (root tsconfig has `files: []`), which
// makes automatic typed linting fragile. Full type safety (including
// templates) is enforced by `npm run build` and `npm run typecheck`.
import eslint from '@eslint/js';
import angular from 'angular-eslint';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', '.angular/**', 'coverage/**', 'out-tsc/**', 'tmp/**'],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' },
      ],
      // Project convention (see angular.json schematics `addTypeToClassName`):
      // component classes intentionally omit the `Component` suffix.
      '@angular-eslint/component-class-suffix': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended, ...angular.configs.templateAccessibility],
  },
  // Must stay last: disables ESLint rules that conflict with Prettier.
  prettier,
);
