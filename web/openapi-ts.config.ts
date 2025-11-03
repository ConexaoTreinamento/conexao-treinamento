import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: '../backend/API/openapi.yml',
    output: 'lib/api-client',
    plugins: [
        '@tanstack/react-query',
    ],
});