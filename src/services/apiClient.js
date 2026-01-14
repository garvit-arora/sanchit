import axios from 'axios';
import { auth } from '../firebase';

// Normalize API URL - ensure localhost uses http, not https
let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fix common issues: https://localhost should be http://localhost
if (API_URL.includes('https://localhost') || API_URL.includes('https://127.0.0.1')) {
    API_URL = API_URL.replace('https://', 'http://');
    console.warn('⚠️  Changed API URL from https to http for localhost');
}

// Ensure it ends with /api if it doesn't already
if (!API_URL.endsWith('/api')) {
    API_URL = API_URL.endsWith('/') ? API_URL + 'api' : API_URL + '/api';
}

console.log('🔗 API URL:', API_URL);

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn('Failed to get auth token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Unauthorized - token may be invalid');
        } else if (error.response?.status === 403) {
            console.error('Forbidden - insufficient permissions');
        } else if (!error.response) {
            console.error('Network error - backend may be down');
        }
        return Promise.reject(error);
    }
);

export default apiClient;
export { API_URL };

