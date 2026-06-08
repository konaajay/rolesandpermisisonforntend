import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
    },
});

// Request Interceptor for Auth
api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const savedUser = localStorage.getItem('auth_user');
        if (savedUser) {
            try {
                const parsed = JSON.parse(savedUser);
                const tenant = parsed.tenant || parsed.tenantDb;
                if (tenant) {
                    config.headers["X-Tenant-DB"] = tenant;
                }
            } catch (e) {
                // Ignore parse errors
            }
        }
        if (import.meta.env.DEV) {
            const headerStr = JSON.stringify(config.headers);
            if (headerStr.length > 8000) {
                console.warn(`[API] High header volume detected: ${headerStr.length} bytes`);
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor for cleaner data access
api.interceptors.response.use(
    (response) => {
        // Handle direct data or wrapped data
        return response.data;
    },
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;
        const path = error.config?.url;
        const isHtml = typeof data === 'string' && data.includes('<!doctype html>');
        
        console.error(`API ERROR [${error.config?.method?.toUpperCase()}] ${path}:`, {
            status,
            data: isHtml ? '[HTML Error Page]' : data,
            message: error.message
        });

        if (isHtml) {
            // Flatten HTML error to a readable message if it's a known Tomcat error
            if (data.includes('Request header is too large')) {
                error.displayMessage = "Request header is too large. Please clear your site data or contact admin.";
            } else {
                error.displayMessage = "The server returned an error page. This usually indicates a configuration issue.";
            }
        } else {
            error.displayMessage = data?.message || data || error.message;
        }

        return Promise.reject(error);
    }
);

// --- Original Marketing API (Compatibility) ---

// Analytics
export const getAnalyticsSummary = () => api.get('/marketing/analytics/summary');

// Customers
export const getCustomers = () => api.get('/marketing/customers');
export const createCustomer = (data) => api.post('/marketing/customers/register', data);
export const updateCustomer = (id, data) => api.put(`/marketing/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/marketing/customers/${id}`);

// Original Email
export const sendBulkEmail = (recipients, subject, body) =>
    api.post('/marketing/email/send-bulk', { recipients, subject, body });
export const sendToAllCustomers = (subject, body) =>
    api.post('/marketing/email/send-all-customers', { subject, body });

// --- New Professional Marketing Suite (Phase 1-4) ---

// Coupons
export const getCoupons = () => api.get('/marketing/admin/coupons');
export const createCoupon = (data) => api.post('/marketing/admin/coupons', data);
export const validateCoupon = (code, courseId, amount) =>
    api.get(`/marketing/coupons/public/validate/${code}`, { params: { courseId, amount } });

// Leads
export const captureLead = (data) => api.post('/leads', data);
export const getLeads = () => api.get('/admin/marketing/campaigns/leads'); // Adjust if backend has different lead list

// Professional Email Campaigns
export const getEmailCampaigns = () => api.get('/admin/marketing/campaigns/all');
export const createEmailCampaign = (data) => api.post('/admin/marketing/campaigns', data);
export const updateEmailCampaign = (id, data) => api.put(`/admin/marketing/campaigns/${id}`, data);
export const deleteEmailCampaign = (id) => api.delete(`/admin/marketing/campaigns/${id}`);
export const scheduleCampaign = (id) => api.post(`/admin/marketing/campaigns/${id}/schedule`);
export const importCsv = (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/marketing/campaigns/${id}/import-csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Event-Based Analytics
export const trackEvent = (data) => api.post('/marketing/analytics/public/track', data);
export const getSourceStats = () => api.get('/marketing/analytics/admin/sources');
export const getFunnelStats = () => api.get('/marketing/analytics/admin/funnel');
export const getConversionRate = () => api.get('/marketing/analytics/admin/conversion-rate');
export const getCampaignStats = () => api.get('/marketing/analytics/admin/campaigns');
export const getMediumStats = () => api.get('/marketing/analytics/admin/mediums');

// Media Upload
export const uploadMedia = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/marketing/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// Landing Pages
export const getLandingPages = () => api.get('/marketing/admin/landing');
export const createLandingPage = (data) => api.post('/marketing/admin/landing', data);
export const updateLandingPage = (id, data) => api.put(`/marketing/admin/landing/${id}`, data);
export const deleteLandingPage = (id) => api.delete(`/marketing/admin/landing/${id}`);
export const getLandingPageBySlug = (slug) => api.get(`/marketing/public/landing/${slug}`);
export const seedLandingPages = () => api.post('/marketing/admin/landing/seed');

// Referral
export const getReferralCode = (learnerId) => api.get(`/marketing/referral/public/code/${learnerId}`);
export const getReferralStats = (learnerId) => api.get(`/marketing/referral/public/stats/${learnerId}`);

// Tracked Links
export const getTrackedLinks = () => api.get('/marketing/admin/tracked-links');
export const createTrackedLink = (data) => api.post('/marketing/admin/tracked-links', data);
export const deleteTrackedLink = (id) => api.delete(`/marketing/admin/tracked-links/${id}`);


export default api;
