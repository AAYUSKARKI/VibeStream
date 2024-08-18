import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../utils/axiosInstance';
import { Video, IVideo } from '../interfaces/Video';

// Define the payload types for the reducers
interface SetLikedStatePayload {
    liked: boolean;
    likesCount: number;
}

interface SetSubscribedStatePayload {
    subscribed: boolean;
    subscriptionCount: number;
}

interface VideoState {
    video: Video | null;
    allVideos: IVideo[] | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    liked: boolean;
    likesCount: number;
    subscribed: boolean;
    subscriptionCount: number;
}

const initialState: VideoState = {
    video: null,
    allVideos: null,
    isLoading: false,
    isError: false,
    error: null,
    liked: false,
    likesCount: 0,
    subscribed: false,
    subscriptionCount: 0,
};

// Thunks
export const fetchVideoById = createAsyncThunk<Video, string>(
    'video/fetchVideoById',
    async (id: string) => {
        const response = await axiosInstance.get(`/videos/${id}`);
        return response.data.data;
    }
);

export const fetchAllVideos = createAsyncThunk<IVideo[]>(
    'video/fetchAllVideos',
    async () => {
        const response = await axiosInstance.get('/videos');
        return response.data.data;
    }
);

export const likeVideo = createAsyncThunk<void, string>(
    'video/likeVideo',
    async (videoId: string, { rejectWithValue }) => {
        try {
            await axiosInstance.post('/likes/like', { videoid: videoId });
        } catch (error: any) {
            return rejectWithValue(error?.response?.data || 'Failed to like video');
        }
    }
);

export const subscribeToChannel = createAsyncThunk<void, string>(
    'video/subscribeToChannel',
    async (channelId: string, { rejectWithValue }) => {
        try {
            await axiosInstance.post('/subscriptions/subscription', { channelid: channelId });
        } catch (error: any) {
            return rejectWithValue(error?.response?.data || 'Failed to subscribe to channel');
        }
    }
);

// Slice
const videoSlice = createSlice({
    name: 'video',
    initialState,
    reducers: {
        setLikedState: (state, action: { payload: SetLikedStatePayload }) => {
            state.liked = action.payload.liked;
            state.likesCount = action.payload.likesCount;
        },
        setSubscribedState: (state, action: { payload: SetSubscribedStatePayload }) => {
            state.subscribed = action.payload.subscribed;
            state.subscriptionCount = action.payload.subscriptionCount;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchVideoById.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchVideoById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.video = action.payload;
                state.liked = action.payload.isLiked;
                state.likesCount = action.payload.likesCount;
                state.subscribed = action.payload.owner.isSubscribed;
                state.subscriptionCount = action.payload.owner.subscribersCount;
            })
            .addCase(fetchVideoById.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.error = action.error.message || 'Something went wrong';
            })
            .addCase(fetchAllVideos.pending, (state) => {
                state.isLoading = true;
                state.isError = false;
            })
            .addCase(fetchAllVideos.fulfilled, (state, action) => {
                state.isLoading = false;
                state.allVideos = action.payload;
            })
            .addCase(fetchAllVideos.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.error = action.error.message || 'Something went wrong';
            })
            .addCase(likeVideo.fulfilled, (state) => {
                state.liked = !state.liked;
                state.likesCount += state.liked ? 1 : -1;
            })
            .addCase(likeVideo.rejected, (state, action) => {
                state.isError = true;
                state.error = action.payload as string || 'Failed to like video';
            })
            .addCase(subscribeToChannel.fulfilled, (state) => {
                state.subscribed = !state.subscribed;
                state.subscriptionCount += state.subscribed ? 1 : -1;
            })
            .addCase(subscribeToChannel.rejected, (state, action) => {
                state.isError = true;
                state.error = action.payload as string || 'Failed to subscribe to channel';
            });
    },
});

export const { setLikedState, setSubscribedState } = videoSlice.actions;

export default videoSlice.reducer;
