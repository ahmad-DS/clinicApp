import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../src/config";

interface UserLoginPayload {
    email: string;
    password: string;
}

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (payload: UserLoginPayload) => {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include" // so that the browser accept the cookie
        });

        if (!response.ok) throw new Error("User login failed");
        const data = await response.json();
        return data;
    }
);

export const verifyUser = createAsyncThunk(
    'auth/verifyUser',
    async () => {
        const response =  await fetch(`${API_BASE_URL}/api/auth/me`, {
            credentials: "include"
        });
        if (!response.ok) throw new Error("Token does not exist or has expired");
        const data = await response.json();
        return data;
    }
)

interface AuthState {
    loggedIn: boolean;
    loginError: string | null;
    loading: boolean;
}
const initialState: AuthState = {
    loggedIn: false,
    loginError: null,
    loading: false
}

export const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = false;
            })
            .addCase(loginUser.fulfilled, (state) => {
                state.loginError = null;
                state.loggedIn = true;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loginError = action.error.message || "User Login failed!";
                state.loggedIn = false;
            });
        builder
            .addCase(verifyUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(verifyUser.fulfilled, (state) => {
                state.loading = false;
                state.loggedIn = true;
            })
            .addCase(verifyUser.rejected, (state) => {
                state.loading = false;
                state.loggedIn = false;
            });
    },
});

export default authSlice.reducer;