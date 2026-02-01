import axios from 'axios';
import { auth } from '../firebase';

// Normalize API URL - ensure localhost uses http, not https
let API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
let PY_API_URL = import.meta.env.VITE_PY_API_URL || 'http://localhost:8000/api';
let ML_API_URL = import.meta.env.VITE_ML_API_URL || 'http://localhost:8100/api';

// Fix common issues: https://localhost should be http://localhost
if (API_URL.includes('https://localhost') || API_URL.includes('https://127.0.0.1')) {
    API_URL = API_URL.replace('https://', 'http://');
    console.warn('⚠️  Changed API URL from https to http for localhost');
}

if (PY_API_URL.includes('https://localhost') || PY_API_URL.includes('https://127.0.0.1')) {
    PY_API_URL = PY_API_URL.replace('https://', 'http://');
    console.warn('⚠️  Changed PY API URL from https to http for localhost');
}

if (ML_API_URL.includes('https://localhost') || ML_API_URL.includes('https://127.0.0.1')) {
    ML_API_URL = ML_API_URL.replace('https://', 'http://');
    console.warn('⚠️  Changed ML API URL from https to http for localhost');
}

// Ensure it ends with /api if it doesn't already
if (!API_URL.endsWith('/api')) {
    API_URL = API_URL.endsWith('/') ? API_URL + 'api' : API_URL + '/api';
}

if (!PY_API_URL.endsWith('/api')) {
    PY_API_URL = PY_API_URL.endsWith('/') ? PY_API_URL + 'api' : PY_API_URL + '/api';
}

if (!ML_API_URL.endsWith('/api')) {
    ML_API_URL = ML_API_URL.endsWith('/') ? ML_API_URL + 'api' : ML_API_URL + '/api';
}

console.log('🔗 API URL:', API_URL);
console.log('🔗 PY API URL:', PY_API_URL);
console.log('🔗 ML API URL:', ML_API_URL);

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
});

const pythonClient = axios.create({
    baseURL: PY_API_URL,
    timeout: 60000
});

const mlClient = axios.create({
    baseURL: ML_API_URL,
    timeout: 60000
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

pythonClient.interceptors.request.use(
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

mlClient.interceptors.request.use(
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
export { API_URL, PY_API_URL, ML_API_URL, pythonClient, mlClient };

