import axios from "axios";
import type {GlobalError} from "@/src/types/common";

//TODO: improve coverage

export const handleGeneralError = (error: unknown, source?: string): never => { //always throws
    if (axios.isAxiosError<GlobalError>(error)) {
        console.error(`[${source || "General"}] Server error:`, error.response?.data);

        if (error.response?.status === 400) {
            throw new Error(error.response?.data?.errorMessage || "The input provided is invalid. Please check input fields.");
        }
        if (error.response?.data.errorCode === "ONBOARDING_INCOMPLETE") {
            throw new Error(error.response.data.errorMessage || "Onboarding has not been completed");
        }
        if (error.response?.status === 403) {
            throw new Error(error.response?.data?.errorMessage || "The request could not be completed due to insufficient permissions to access this resource");
        }
        if (error.response?.status === 404) {
            throw new Error(error.response?.data?.errorMessage || "The requested resource could not be found");
        }
        if (error.response?.status === 409) {
            throw new Error(error.response?.data?.errorMessage || "The request could not be completed due to a conflict with existing data");
        }
        throw new Error(error.response?.data.errorMessage || "An unexpected error occurred");
    }

    console.error(`[${source || "General"}] Non-server error:`, error);
    throw new Error("An unexpected error occurred");
}