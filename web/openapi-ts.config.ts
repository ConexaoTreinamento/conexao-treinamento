import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: 'https://beeceptor.com/docs/storefront-sample.yaml',
    output: 'lib/api-client',
    plugins: [
        '@tanstack/react-query',
    ],
});