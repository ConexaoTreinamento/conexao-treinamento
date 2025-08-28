import { createClient, createConfig } from './api-client/client'
import type { ClientOptions } from './api-client/types.gen'

// Create a custom client with query serializer for nested objects
export const apiClient = createClient(createConfig<ClientOptions>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    querySerializer: (params) => {
        const searchParams = new URLSearchParams();
        
        const flattenObject = (obj: any, prefix = '') => {
            for (const key in obj) {
                if (obj[key] != null) {
                    const paramKey = prefix ? `${prefix}.${key}` : key;
                    if (typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                        // Special handling for pageable object - flatten to root level
                        flattenObject(obj[key], paramKey === 'pageable' ? '' : paramKey);
                    } else if (Array.isArray(obj[key])) {
                        obj[key].forEach((item: any) => {
                            searchParams.append(paramKey, item.toString());
                        });
                    } else {
                        searchParams.append(paramKey, obj[key].toString());
                    }
                }
            }
        };
        
        flattenObject(params);
        return searchParams.toString();
    }
}));
