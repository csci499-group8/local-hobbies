import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { AuthRefreshRequest, AuthResponse } from '@/src/types/auth';
import {Platform} from "react-native";

//backend base URL
//if running in dev and not in an emulator, must use server's actual IP address
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? (
    __DEV__
        ? Platform.OS === 'android'
            ? 'http://10.0.2.2:8080/api'
            : 'http://localhost:8080/api'
        : 'http://localhost:8080/api'
);

console.log('DEBUG: Current BASE_URL is:', BASE_URL);

//token keys
export const SECURE_STORE_KEYS = {
    ACCESS_TOKEN:  'accessToken',
    REFRESH_TOKEN: 'refreshToken',
} as const;

// Axios instance
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10_000,
});
export default apiClient;

apiClient.interceptors.request.use(config => {
    console.log('Request:', config.method?.toUpperCase(), config.url,
        'Auth:', config.headers.Authorization ? 'present' : 'missing');
    return config;
});

// request interceptor
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

//response interceptor

let isRefreshing = false; //indicates refresh is in progress to prevent duplicate calls

let refreshQueue: Array<{ //stores requests that fail due to 401 error while refresh is occurring
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
}> = [];

//helper that processes refresh queue once refresh result is returned
function processRefreshQueue(error: unknown, token: string | null) {
    refreshQueue.forEach(({ resolve, reject }) =>
        token ? resolve(token) : reject(error),
    );
    refreshQueue = [];
}

//interceptor
apiClient.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        //attach _retried property to config
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retried?: boolean; };

        //reject if error is not 401 error, retry was already attempted, or error came from attempting the refresh itself

        const is401 = error.response?.status === 401;
        const alreadyRetried = originalRequest._retried;
        const isAuthEndpoint = originalRequest.url?.includes('/auth/');
        const isRefreshEndpoint = originalRequest.url?.includes('/auth/refresh');

        if (!is401 || alreadyRetried || isAuthEndpoint || isRefreshEndpoint) {
            return Promise.reject(error);
        }

        //if refresh is in progress, queue arriving requests
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({
                    //if refresh succeeded, retry queued requests with updated token header and return result
                    resolve: (token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(apiClient(originalRequest));
                    },
                    reject,
                });
            });
        }

        //attempt refresh
        //only the first 401 request gets here; other requests get caught by earlier if-return statements

        originalRequest._retried = true;
        isRefreshing = true;

        try {
            //look for refresh token
            const refreshToken = await SecureStore.getItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
            if (!refreshToken) throw new Error('No refresh token stored');

            //attempt refresh
            const { data } = await axios.post<AuthResponse>(
                `${BASE_URL}/auth/refresh`,
                { refreshToken } as AuthRefreshRequest
            );
            const newAccessToken = data.auth.accessToken;
            const newRefreshToken = data.auth.refreshToken;

            //save new tokens
            await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, newAccessToken);
            await SecureStore.setItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN, newRefreshToken);

            //update default header for future requests
            apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

            //update current request's header
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            //process all queued requests
            processRefreshQueue(null, newAccessToken);

            return apiClient(originalRequest);
        } catch (refreshError) {
            //if refresh fails, end user's session
            processRefreshQueue(refreshError, null);
            await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
            await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);

            await triggerLogout();

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

let logoutCallback: (() => Promise<void>) | null = null;

//hold a reference to AuthContext's onLogout to avoid importing AuthContext,
//which would cause a circular dependency
export const registerLogoutCallback = (fn: () => Promise<void>) => {
    logoutCallback = fn;
};

export const triggerLogout = async () => {
    if (logoutCallback) await logoutCallback();
};