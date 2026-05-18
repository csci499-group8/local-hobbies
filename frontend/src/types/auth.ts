/**
 * Request body for creating a new account
 */
export interface AuthSignupRequest {
    username: string;
    password: string;
    email: string;
}

/**
 * Request body for logging in
 */
export interface AuthLoginRequest {
    username: string;
    password: string;
}

/**
 * Request body for refreshing an expired access token
 */
export interface AuthRefreshRequest {
    refreshToken: string;
}

/**
 * Response returned after successful signup, login, or session refresh
 */
export interface AuthResponse {
    auth: {
        accessToken: string;
        tokenType: string; // e.g., "Bearer"
        /** ISO 8601 UTC timestamp */
        expirationTime: string;
        refreshToken: string;
    };
    user: {
        id: string;
        /** Used to route user to either homepage (true) or onboarding (false) */
        onboardingComplete: boolean;
    };
}