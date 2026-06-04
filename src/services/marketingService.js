import apiClient from './apiClient';

const BASE_URL = '/api/v1/admin/marketing/campaigns';

export const marketingService = {

    /**
     * Create a new marketing campaign
     * @param {Object} campaignData - Matches Campaign entity fields
     */
    createCampaign: async (campaignData) => {
        const response = await apiClient.post(BASE_URL, campaignData);
        return response.data;
    },

    /**
     * Get all campaigns (Admin view)
     */
    getAllCampaigns: async () => {
        const response = await apiClient.get(`${BASE_URL}/all`);
        return response.data;
    },

    /**
     * Get campaign by ID
     */
    getCampaignById: async (id) => {
        const response = await apiClient.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Update campaign status or details
     */
    updateCampaign: async (id, campaignData) => {
        const response = await apiClient.put(`${BASE_URL}/${id}`, campaignData);
        return response.data;
    },

    /**
     * Delete a campaign
     */
    deleteCampaign: async (id) => {
        const response = await apiClient.delete(`${BASE_URL}/${id}`);
        return response.data;
    },

    /**
     * Get marketing summary metrics
     */
    getMarketingSummary: async () => {
        const response = await apiClient.get(`${BASE_URL}/summary`);
        return response.data;
    }
};
