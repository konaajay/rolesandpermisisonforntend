import axios from 'axios';

const API_BASE_URL = '/api/community';

// FALLBACK TOKEN PROVIDED BY USER
const VALID_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzYW50b3NoY2hhdml0aGluaTIwMDRAZ21haWwuY29tIiwidXNlcklkIjoxLCJyb2xlcyI6WyJST0xFX1NVUEVSX0FETUlOIl0sInBlcm1pc3Npb25zIjpbIioiXSwidGVuYW50RGIiOiJsbXNfdGVuYW50XzE3NzA3MDExMDEwODYiLCJpYXQiOjE3NzM0OTAwODR9.zQmLV4tuTHseJree70M-sG4W31ls-PXZCPFFuRGcMmxEevsuEeVpKJLgnQSZL7-JWeoMpARUN4zB0e-IGAHHoA";

const getAuthToken = () => {
    return localStorage.getItem('authToken') || import.meta.env.VITE_DEV_AUTH_TOKEN || VALID_TOKEN;
};

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// --- API FUNCTIONS ---

// SPACES (CLUBS)
export const getSpaces = async () => {
    const response = await apiClient.get('/spaces');
    return response.data;
};

export const createSpace = async (spaceData) => {
    const response = await apiClient.post('/spaces', spaceData);
    return response.data;
};

export const updateSpace = async (spaceId, spaceData) => {
    const response = await apiClient.put(`/spaces/${spaceId}`, spaceData);
    return response.data;
};

export const searchSpaces = async (query) => {
    const response = await apiClient.get('/spaces/search', { params: { search: query } });
    return response.data;
};

// CHANNELS
export const getChannels = async (spaceId) => {
    const response = await apiClient.get(`/spaces/${spaceId}/channels`);
    return response.data;
};

export const createChannel = async (channelData) => {
    const response = await apiClient.post('/channels', channelData);
    return response.data;
};

export const updateChannel = async (channelId, channelData) => {
    const response = await apiClient.put(`/channels/${channelId}`, channelData);
    return response.data;
};

// THREADS (POSTS)
export const getThreads = async (channelId) => {
    const response = await apiClient.get(`/threads/${channelId}`);
    return response.data;
};

export const getThreadById = async (threadId) => {
    const response = await apiClient.get(`/thread/${threadId}`);
    return response.data;
};

export const createThread = async (threadData) => {
    const response = await apiClient.post('/threads', threadData);
    return response.data;
};

// REPLIES
export const createReply = async (threadId, replyData) => {
    const response = await apiClient.post(`/threads/${threadId}/reply`, replyData);
    return response.data;
};

// REACTIONS
export const reactToItem = async (reactionData) => {
    const response = await apiClient.post('/react', reactionData);
    return response.data;
};

// BOOKMARKS
export const bookmarkItem = async (bookmarkData) => {
    // Switching back to JSON body for bookmarks to resolve 400 Bad Request
    const response = await apiClient.post('/bookmark', bookmarkData);
    return response.data;
};

export const getBookmarks = async (userId) => {
    const response = await apiClient.get(`/bookmarks/${userId}`);
    return response.data;
};

// NOTIFICATIONS & MENTIONS
export const getNotifications = async (userId) => {
    const response = await apiClient.get(`/notifications/${userId}`);
    return response.data;
};

export const getMentions = async (userId) => {
    const response = await apiClient.get(`/mentions/${userId}`);
    return response.data;
};

export const mentionUser = async (threadId, mentionedUserId, replyId = null) => {
    // Backend expects threadId and mentionedUserId as query parameters
    const params = { threadId, mentionedUserId };
    if (replyId) params.replyId = replyId;
    const response = await apiClient.post('/mention', null, { params });
    return response.data;
};

// REPORTS
export const reportItem = async (reportData) => {
    const response = await apiClient.post('/report', reportData);
    return response.data;
};

export default {
    getSpaces,
    createSpace,
    updateSpace,
    searchSpaces,
    getChannels,
    createChannel,
    updateChannel,
    getThreads,
    getThreadById,
    createThread,
    createReply,
    reactToItem,
    bookmarkItem,
    getBookmarks,
    getNotifications,
    getMentions,
    mentionUser,
    reportItem
};
