import apiClient from '../config';
import { AuthLoginRequest, AuthSignupRequest, AuthResponse } from '../../types/auth';
import axios from "axios";
import type {GlobalError} from "@/src/types/common";
import {handleGeneralError} from "@/src/utils/error-helpers";

const authService = {
    /**
     * Register a new user
     */
    signup: async (request: AuthSignupRequest): Promise<AuthResponse> => {
        try {
            console.log('authService.login called with:', request.username);
            const {data} = await apiClient.post<AuthResponse>('/auth/signup', request);
            console.log('authService.login response:', data);
            return data;
        } catch (error: unknown) {
            console.log('authService.login error:', error);

            if (axios.isAxiosError<GlobalError>(error) && error.response?.status === 409) {
                throw new Error(error.response?.data?.errorMessage || 'An account with this username or email already exists');
            }
            return handleGeneralError(error, "authService.signup");
        }
    },

    /**
     * Authenticate a user and start a session
     */
    login: async (request: AuthLoginRequest): Promise<AuthResponse> => {
        try {
            const {data} = await apiClient.post<AuthResponse>('/auth/login', request);
            return data;
        } catch (error: unknown) {
            if (axios.isAxiosError<GlobalError>(error) && error.response?.status === 401) {
                throw new Error(error.response?.data?.errorMessage || 'Username or password is invalid');
            }
            return handleGeneralError(error, "authService.login")
        }
    },
};

export default authService;
