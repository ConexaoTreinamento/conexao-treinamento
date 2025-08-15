import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: '../docs/api/openapi.json',
    output: 'lib/api-client',
    plugins: [
        '@tanstack/react-query',
    ],
});