import { apiFetch } from "./api";

const API_BASE_URL = "/api/certificates";

export const certificateService = {
    // Manual Generate
    manualGenerate: async (data) => {
        return apiFetch(`${API_BASE_URL}/manual-generate`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    // Verify Certificate (Token)
    verifyCertificate: async (token) => {
        return apiFetch(`${API_BASE_URL}/verify?token=${token}`);
    },

    verifyCertificatePost: async (token) => {
        return apiFetch(`${API_BASE_URL}/verify`, {
            method: "POST",
            body: JSON.stringify({ token }),
        });
    },

    // Get User Certificates
    getCertificatesByUser: async (userId) => {
        return apiFetch(`${API_BASE_URL}/user/${userId}`);
    },

    // Revoke Certificate
    revokeCertificate: async (id, reason) => {
        return apiFetch(`${API_BASE_URL}/${id}/revoke`, {
            method: "PUT",
            body: JSON.stringify({ reason }),
        });
    },

    // Update Expiry
    updateExpiry: async (id, expiryDate) => {
        return apiFetch(`${API_BASE_URL}/${id}/expiry`, {
            method: "PUT",
            body: JSON.stringify({ expiryDate }),
        });
    },

    // Get Certificate By ID
    getCertificateById: async (id) => {
        return apiFetch(`${API_BASE_URL}/${id}`);
    },

    // Renew Certificate
    renewCertificate: async (id, renewalData) => {
        return apiFetch(`${API_BASE_URL}/${id}/renew`, {
            method: "PUT",
            body: JSON.stringify(renewalData),
        });
    },

    // Get All Certificates
    getAllCertificates: async () => {
        return apiFetch(`${API_BASE_URL}`);
    },

    // Get Certificate Stats
    getStats: async () => {
        return apiFetch(`${API_BASE_URL}/stats`);
    },

    // Bulk Generate
    bulkGenerate: async (targetData) => {
        return apiFetch(`${API_BASE_URL}/bulk-generate`, {
            method: "POST",
            body: JSON.stringify(targetData),
        });
    },

    // Bulk Generate by Batch
    bulkGenerateByBatch: async (batchId) => {
        return apiFetch(`${API_BASE_URL}/bulk-generate/batch/${batchId}`, {
            method: "POST",
        });
    },

    // Send Certificate Email Manually
    sendCertificateEmail: async (id) => {
        return apiFetch(`${API_BASE_URL}/${id}/send-email`, {
            method: "POST",
        });
    },
};
