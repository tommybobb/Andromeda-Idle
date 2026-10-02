export default [
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        window: 'readonly', document: 'readonly', localStorage: 'readonly', navigator: 'readonly', location: 'readonly',
        console: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', setInterval: 'readonly', requestAnimationFrame: 'readonly',
        performance: 'readonly', getComputedStyle: 'readonly', Intl: 'readonly', TextEncoder: 'readonly', TextDecoder: 'readonly',
        btoa: 'readonly', atob: 'readonly', Blob: 'readonly', URL: 'readonly', self: 'readonly', caches: 'readonly', fetch: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { args: 'none' }],
      'no-unreachable': 'error',
      'no-dupe-keys': 'error',
      'no-const-assign': 'error',
    },
  },
];
