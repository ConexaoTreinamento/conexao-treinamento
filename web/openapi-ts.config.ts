import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: 'http://localhost:8080/v3/api-docs',
    output: 'lib/api-client',
    plugins: [
        '@tanstack/react-query',
    ],
});