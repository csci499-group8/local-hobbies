import React, {createContext, useContext, useEffect, useState} from "react";
import * as SecureStore from 'expo-secure-store';
import apiClient, {registerLogoutCallback} from '@/src/api/config';
import {AuthLoginRequest, AuthResponse, AuthSignupRequest} from "@/src/types/auth";
import {SECURE_STORE_KEYS} from "@/src/api/config";
import authService from "@/src/api/services/auth-service";

interface AuthContextType {
    user: AuthResponse["user"] | null; //?
    isLoading: boolean;
    onSignup: (request: AuthSignupRequest) => Promise<void>;
    onLogin: (request: AuthLoginRequest) => Promise<void>;
    onLogout: () => Promise<void>;
    updateAfterOnboarding: (response: AuthResponse) => Promise<void>;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthResponse["user"] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    //on app launch, retrieve last session
    useEffect(() => {
        const loadStoredSession = async () => {
            try {
                //TODO: TEMPORARY!!!
                await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
                await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
                await SecureStore.deleteItemAsync('userId');
                await SecureStore.deleteItemAsync('onboardingComplete');
                //TODO: END TEMPORARY
                const token = await SecureStore.getItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
                const savedId = await SecureStore.getItemAsync('userId');
                const savedOnboardingStatus = await SecureStore.getItemAsync('onboardingComplete');

                if (token && savedId) {
                    setUser({
                        id: savedId,
                        onboardingComplete: savedOnboardingStatus === 'true'
                    });
                }
            } catch (error: unknown) {
                console.warn("No session restored:", error);
            } finally {
                setIsLoading(false);
            }
        };
        void loadStoredSession();
    }, []);

    useEffect(() => {
        registerLogoutCallback(onLogout);

        return () => registerLogoutCallback(async () => {});
    }, []);

    const onSignup = async (request: AuthSignupRequest) => {
        const data = await authService.signup(request);

        await storeState(data);
    }

    const onLogin = async (request: AuthLoginRequest) => {
        console.log('onLogin called');
        const data = await authService.login(request);

        await storeState(data);
        console.log('storeState complete');
    };

    const onLogout = async() => {
        try {
            await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN);
            await SecureStore.deleteItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN);
            await SecureStore.deleteItemAsync('userId');
            await SecureStore.deleteItemAsync('onboardingComplete');
        } catch (error: unknown) {
            console.error("Error during logout cleanup:", error);
        } finally {
            setUser(null);
        }
    }

    const updateAfterOnboarding = async (response: AuthResponse) => {
        //store new tokens and user information
        await storeState(response);
    };

    const storeState = async (data: AuthResponse) => {
        console.log('storeState called, token:', data.auth.accessToken ? 'present' : 'missing');

        //set default header immediately to beat race condition
        apiClient.defaults.headers.common.Authorization = `Bearer ${data.auth.accessToken}`;

        //persist everything needed to resume a session later
        await SecureStore.setItemAsync(SECURE_STORE_KEYS.ACCESS_TOKEN, data.auth.accessToken);
        await SecureStore.setItemAsync(SECURE_STORE_KEYS.REFRESH_TOKEN, data.auth.refreshToken);
        await SecureStore.setItemAsync('userId', data.user.id);
        await SecureStore.setItemAsync('onboardingComplete', String(data.user.onboardingComplete));

        //update React state
        setUser(data.user);
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, onSignup, onLogin, onLogout, updateAfterOnboarding }}>
            {children}
        </AuthContext.Provider>
    );
};