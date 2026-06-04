import axios from 'axios';
import { AUTH_TOKEN_KEY } from './auth.constants';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use((config) => {
    const isValid = (val) => val && val !== 'null' && val !== 'undefined';

    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const url = config.url || '';
    const isAffiliateRequest = url.includes('/affiliate') ||
        url.includes('/admin/affiliate') ||
        url.includes('/admin/leads') ||
        url.includes('/admin/sales');

    if (isValid(token) && !isAffiliateRequest) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    const savedUser = localStorage.getItem('auth_user');
    if (isValid(savedUser)) {
        try {
            const parsed = JSON.parse(savedUser);
            const tenant = parsed.tenant || parsed.tenantDb;
            if (isValid(tenant)) {
                config.headers["X-Tenant-DB"] = tenant;
            }
        } catch (e) { }
    }

    return config;
}, (error) => Promise.reject(error));

export default apiClient;
