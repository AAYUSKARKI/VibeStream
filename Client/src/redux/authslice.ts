import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../utils/axiosInstance";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

// Define your initial state with a TypeScript interface
interface InitialStateType {
    loading: boolean;
    user: null | any; // Replace `any` with your actual user type
    error: null | unknown;
}

const initialState: InitialStateType = {
    loading: false,
    user: null,
    error: null,
};

// Thunk for user registration
export const registerUser = createAsyncThunk('auth/register', async (data: any) => {
    try {
        const response = await axiosInstance.post('/users/register', data);
        toast.success(response.data.message);
        return response.data.data;
    } catch (error: any) {
        toast.error(error.response.data.message);
        throw new Error(error.response.data.message);
    }
});

// Thunk for user login
export const loginUser = createAsyncThunk('auth/login', async (data: any) => {
    try {
        const response = await axiosInstance.post('/users/login', data);
        localStorage.setItem('accesstoken', response.data.data.accesstoken);
        toast.success(response.data.message);
        return response.data.data;
    } catch (error: any) {
        toast.error(error.response.data.message);
        throw new Error(error.response.data.message);
    }
});

// Thunk for user logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
    try {
        const response = await axiosInstance.post('/users/logout');
        toast.success(response.data.message);
        Cookies.remove('accesstoken');
        return response.data.data;
    } catch (error: any) {
        toast.error(error.response.data.message);
        throw new Error(error.response.data.message);
    }
});

// Slice for authentication
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            })
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null; // Reset user on logout
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message;
            });
    },
});

export default authSlice.reducer;
