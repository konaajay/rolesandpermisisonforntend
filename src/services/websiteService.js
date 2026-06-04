import axios from 'axios';

const API_BASE = '/website/themes';
const SEO_BASE = '/website/seo';
const HEADER_BASE = '/website/header';
const SETTINGS_BASE = '/website/settings';

// Helper to get auth token
const VALID_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJzYW50b3NoY2hhdml0aGluaTIwMDRAZ21haWwuY29tIiwidXNlcklkIjoxLCJyb2xlcyI6WyJST0xFX1NVUEVSX0FETUlOIl0sInBlcm1pc3Npb25zIjpbIioiXSwidGVuYW50RGIiOiJsbXNfdGVuYW50XzE3NzA3MDExMDEwODYiLCJpYXQiOjE3NzI3NzY1NTR9.nml_BxtN6jPhrJNdoJp0zYlqwIbmuhstuZLci5DtQz14sxgnG9o_dVP0thA29i7EM6pK1fSL3sGNQgJlxZe4lg";

const getAuthToken = () => {
    return localStorage.getItem('authToken') || import.meta.env.VITE_DEV_AUTH_TOKEN || VALID_TOKEN;
};

// Use Axios for consistency with other working services
const apiClient = axios.create({
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

apiClient.interceptors.request.use(config => {
    const token = getAuthToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Helper for authenticated requests (JSON responses)
const fetchWithAuth = async (url, options = {}) => {
    try {
        console.log(`🌐 fetchWithAuth [${options.method || 'GET'}] ${url}`);
        const response = await apiClient({
            url,
            method: options.method || 'GET',
            data: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined, // Axios expects JS object for JSON
            ...options, // Spread remaining options, but be careful if they conflict with axios config
            headers: {
                ...apiClient.defaults.headers, // Include default headers
                ...options.headers // Override with specific options headers
            }
        });
        console.log(`📡 response status: ${response.status} for ${url}`);
        return response.data; // Axios automatically parses JSON
    } catch (error) {
        console.error(`📡 websiteService API Error [${options.method || 'GET'}] ${url}:`, error.response?.status, error.response?.data);
        throw new Error(error.response?.data?.message || error.response?.data || `HTTP ${error.response?.status || 'Unknown'}`);
    }
};

// Helper for authenticated requests returning plain text
const fetchWithAuthText = async (url, options = {}) => {
    try {
        const response = await apiClient({
            url,
            method: options.method || 'GET',
            responseType: 'text', // Explicitly request text response
            data: options.body, // Axios uses 'data' for body
            ...options,
            headers: {
                ...apiClient.defaults.headers,
                'Content-Type': options.headers?.['Content-Type'] || 'application/json', // Ensure Content-Type is set if not provided
                ...options.headers
            }
        });
        return response.data;
    } catch (error) {
        console.error(`📡 websiteService API Error (text) [${options.method || 'GET'}] ${url}:`, error.response?.status, error.response?.data);
        throw new Error(error.response?.data?.message || error.response?.data || `HTTP ${error.response?.status || 'Unknown'}`);
    }
};

// Helper for fetching blobs (images) with authentication
const fetchImageBlobWithAuth = async (url) => {
    try {
        const response = await apiClient({
            url,
            method: 'GET',
            responseType: 'blob'
        });
        return response.data;
    } catch (error) {
        console.error(`📡 websiteService API Error (blob) [GET] ${url}:`, error.response?.status);
        throw error;
    }
};

export const websiteService = {
    // =========================================
    // IMAGE BLOB — Fetch with auth
    // =========================================
    getImageBlob: (url) => fetchImageBlobWithAuth(url),

    // =========================================
    // Get available theme templates from master DB
    // =========================================
    getAvailableThemes: async () => {
        return fetchWithAuth(`${API_BASE}/templates`);
    },

    // =========================================
    // Apply a theme as DRAFT (creates tenant theme)
    // =========================================
    applyTheme: async (themeId) => {
        return fetchWithAuth(`${API_BASE}/apply/${themeId}`, {
            method: 'POST',
        });
    },

    // =========================================
    // Publish a draft theme to LIVE
    // =========================================
    publishTheme: async (tenantThemeId) => {
        return fetchWithAuth(`${API_BASE}/publish/${tenantThemeId}`, {
            method: 'POST',
        });
    },

    // =========================================
    // Delete a draft theme
    // =========================================
    deleteDraftTheme: async (tenantThemeId) => {
        return fetchWithAuth(`${API_BASE}/${tenantThemeId}`, {
            method: 'DELETE',
        });
    },

    // =========================================
    // Get all pages for a specific tenant theme (Strict Synchronization)
    // =========================================
    getThemePages: async (tenantThemeId, isLive = false) => {
        if (!tenantThemeId) return [];

        try {
            let pages = [];

            // 1. If it's the live theme, try the summary endpoint first
            if (isLive) {
                console.log("🌐 Fetching Theme [LIVE SUMMARY]: /website/themes/live");
                const themeData = await fetchWithAuth(`${API_BASE}/live`);
                if (themeData) {
                    pages = Array.isArray(themeData) ? themeData : (themeData.pages || themeData.data);
                    if (pages && Array.isArray(pages) && pages.length > 0) {
                        return pages;
                    }
                }
                console.log("ℹ️ LIVE summary had no pages, falling back to detail endpoint.");
            }

            // 2. Fetch/Fallback to detailed theme structure
            console.log(`🌐 Fetching Theme [DETAIL]: ${API_BASE}/${tenantThemeId}`);
            const data = await fetchWithAuth(`${API_BASE}/${tenantThemeId}`);

            if (data) {
                // Check all known keys where pages might hide
                const extracted = Array.isArray(data) ? data : (data.pages || data.data || data.theme?.pages);
                if (Array.isArray(extracted)) {
                    return extracted;
                }
            }

            console.warn("⚠️ Backend returned theme structure without a valid pages array:", data);
            return [];
        } catch (error) {
            console.error(`❌ [websiteService] getThemePages failed for ${tenantThemeId}:`, error.message);
            throw error;
        }
    },

    // =========================================
    // Preview specific theme (get structure)
    // =========================================
    getThemeById: async (tenantThemeId) => {
        return fetchWithAuth(`${API_BASE}/${tenantThemeId}`);
    },

    // =========================================
    // Get live theme structure (public endpoint)
    // =========================================
    getLiveTheme: async () => {
        try {
            const data = await fetchWithAuth(`${API_BASE}/live`);
            if (data && typeof data === 'object') {
                return {
                    ...data,
                    tenantThemeId: data.tenantThemeId || data.tenant_theme_id || data.id,
                    status: 'live'
                };
            }
            return data;
        } catch (error) {
            console.error("Error fetching live theme:", error);
            // Don't throw here, just return null to allow fallback to draft
            return null;
        }
    },

    // =========================================
    // Update section configuration
    // =========================================
    updateSection: async (sectionId, configJson) => {
        return fetchWithAuth(`${API_BASE}/section/${sectionId}`, {
            method: 'PUT',
            body: JSON.stringify(configJson),
        });
    },

    // =========================================
    // Reset section to default
    // =========================================
    resetSection: async (sectionId) => {
        return fetchWithAuth(`${API_BASE}/section/${sectionId}/reset`, {
            method: 'POST',
        });
    },

    // =========================================
    // Update page title
    // =========================================
    updatePageTitle: async (pageId, title) => {
        return fetchWithAuth(`${API_BASE}/page/${pageId}/title`, {
            method: 'PUT',
            body: typeof title === 'string' ? title : JSON.stringify(title),
        });
    },



    // =========================================
    // HEADER CONFIG — Save
    // =========================================
    saveHeader: async (tenantThemeId, headerJson) => {
        return fetchWithAuth(`${API_BASE}/${tenantThemeId}/header`, {
            method: 'PUT',
            body: typeof headerJson === 'string' ? headerJson : JSON.stringify(headerJson),
        });
    },

    // =========================================
    // HEADER CONFIG — Get
    // =========================================
    getHeader: async (tenantThemeId) => {
        const text = await fetchWithAuthText(`${API_BASE}/${tenantThemeId}/header`);
        if (!text) return null;
        try {
            const parsed = JSON.parse(text);
            const normalized = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
            return {
                ...normalized,
                links: normalized.links ? (typeof normalized.links === 'string' ? JSON.parse(normalized.links) : normalized.links) : []
            };
        } catch (e) {
            console.error("Failed to parse header data:", e);
            return null;
        }
    },

    // =========================================
    // FOOTER CONFIG — Save
    // =========================================
    saveFooter: async (tenantThemeId, footerJson) => {
        return fetchWithAuth(`${API_BASE}/${tenantThemeId}/footer`, {
            method: 'PUT',
            body: typeof footerJson === 'string' ? footerJson : JSON.stringify(footerJson),
        });
    },

    // =========================================
    // FOOTER CONFIG — Get
    // =========================================
    getFooter: async (tenantThemeId) => {
        const text = await fetchWithAuthText(`${API_BASE}/${tenantThemeId}/footer`);
        if (!text) return null;
        try {
            const parsed = JSON.parse(text);
            const normalized = typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
            return {
                ...normalized,
                links: normalized.links ? (typeof normalized.links === 'string' ? JSON.parse(normalized.links) : normalized.links) : {}
            };
        } catch (e) {
            console.error("Failed to parse footer data:", e);
            return null;
        }
    },

    // =========================================
    // SEO CONFIG — Save
    // =========================================
    saveSeo: async (tenantThemeId, seoJson) => {
        return fetchWithAuth(`${SEO_BASE}/${tenantThemeId}`, {
            method: 'PUT',
            body: typeof seoJson === 'string' ? seoJson : JSON.stringify(seoJson),
        });
    },

    // =========================================
    // SEO CONFIG — Get
    // =========================================
    getSeo: async (tenantThemeId) => {
        return fetchWithAuthText(`${SEO_BASE}/${tenantThemeId}`);
    },

    // =========================================
    // ROBOTS.TXT — Save
    // =========================================
    saveRobots: async (tenantThemeId, robotsContent) => {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'text/plain',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${SEO_BASE}/${tenantThemeId}/robots`, {
            method: 'PUT',
            headers,
            body: robotsContent,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP ${response.status}`);
        }
        return response.text();
    },

    // =========================================
    // ROBOTS.TXT — Get
    // =========================================
    getRobots: async (tenantThemeId) => {
        return fetchWithAuthText(`${SEO_BASE}/${tenantThemeId}/robots`);
    },

    // =========================================
    // SITEMAP — Upload
    // =========================================
    uploadSitemap: async (tenantThemeId, file) => {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('file', file);

        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${SEO_BASE}/${tenantThemeId}/sitemap`, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP ${response.status}`);
        }
        return response.text();
    },

    // =========================================
    // SITEMAP — Get (returns blob)
    // =========================================
    getSitemap: async (tenantThemeId) => {
        const token = getAuthToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${SEO_BASE}/${tenantThemeId}/sitemap`, { headers });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.blob();
    },

    // =========================================
    // SITEMAP — Delete
    // =========================================
    deleteSitemap: async (tenantThemeId) => {
        return fetchWithAuth(`${SEO_BASE}/${tenantThemeId}/sitemap`, {
            method: 'DELETE',
        });
    },

    // =========================================
    // CUSTOM HEADER — Save (creates a new tenant_header row)
    // Returns the headerId (Long)
    // =========================================
    saveCustomHeader: async (headerConfigJson) => {
        return fetchWithAuth(`${HEADER_BASE}/save`, {
            method: 'POST',
            body: typeof headerConfigJson === 'string' ? headerConfigJson : JSON.stringify(headerConfigJson),
        });
    },

    // =========================================
    // CUSTOM HEADER — List all saved headers
    // =========================================
    listCustomHeaders: async () => {
        return fetchWithAuth(`${HEADER_BASE}/list`);
    },

    // =========================================
    // CUSTOM HEADER — Apply a saved header to a theme
    // =========================================
    applyCustomHeader: async (tenantThemeId, headerId) => {
        return fetchWithAuth(`${HEADER_BASE}/apply?tenantThemeId=${tenantThemeId}&headerId=${headerId}`, {
            method: 'POST',
        });
    },

    // =========================================
    // CUSTOM HEADER — Revert to default header
    // =========================================
    revertHeaderToDefault: async (tenantThemeId) => {
        return fetchWithAuth(`${HEADER_BASE}/revert?tenantThemeId=${tenantThemeId}`, {
            method: 'POST',
        });
    },

    // =========================================
    // CUSTOM HEADER — Export as ZIP (html + css)
    // =========================================
    exportHeader: async (html, css) => {
        const token = getAuthToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${HEADER_BASE}/export`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ html, css }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || `HTTP ${response.status}`);
        }
        return response.blob();
    },

    // =========================================
    // SETTINGS — Get all settings
    // =========================================
    getSettings: async () => {
        return fetchWithAuth(`${SETTINGS_BASE}`);
    },

    // =========================================
    // SETTINGS — Update site name
    // =========================================
    updateSiteName: async (siteName) => {
        const token = getAuthToken();
        const headers = { 'Content-Type': 'text/plain' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${SETTINGS_BASE}/site-name`, {
            method: 'PUT',
            headers,
            body: siteName,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    },

    // =========================================
    // SETTINGS — Upload logo
    // =========================================
    uploadLogo: async (file) => {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('file', file);

        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    },

    // =========================================
    // GENERIC MEDIA — Upload
    // =========================================
    uploadMedia: async (file, category = 'media') => {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);

        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Using settings/logo as a fallback if a generic media endpoint doesn't exist.
        // It's known to work for images.
        const response = await fetch(`${SETTINGS_BASE}/logo`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    },

    // =========================================
    // SETTINGS — Upload favicon
    // =========================================
    uploadFavicon: async (file) => {
        const token = getAuthToken();
        const formData = new FormData();
        formData.append('file', file);

        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch(`${SETTINGS_BASE}/favicon`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    },

    // =========================================
    // SETTINGS — Update footfall enabled
    // =========================================
    updateFootfall: async (enabled) => {
        return fetchWithAuth(`${SETTINGS_BASE}/footfall`, {
            method: 'PUT',
            body: JSON.stringify(enabled),
        });
    },

    // =========================================
    // SETTINGS — Update store theme
    // =========================================
    updateStoreTheme: async (viewType, storeConfigJson) => {
        return fetchWithAuth(`${SETTINGS_BASE}/store?viewType=${viewType}`, {
            method: 'PUT',
            body: storeConfigJson ? JSON.stringify(storeConfigJson) : undefined,
        });
    },

    // =========================================
    // CUSTOM PAGES / BUILDER LOGIC (Scratch built)
    // =========================================
    CUSTOM_PAGE_BASE: '/website/custom-page',

    searchCustomPages: async (keyword = '') => {
        return fetchWithAuth(`/website/custom-page/search?q=${keyword}`);
    },

    getCustomPage: async (pageId) => {
        try {
            // Try fetching full page details
            return await fetchWithAuth(`/website/custom-page/${pageId}`);
        } catch (e) {
            console.warn(`Detail fetch failed for ${pageId}, trying /sections...`);
            // Fallback to fetching sections directly
            const sections = await fetchWithAuth(`/website/custom-page/${pageId}/sections`);
            return { sections };
        }
    },

    createCustomPage: async (title, slug) => {
        return fetchWithAuth(`/website/custom-page`, {
            method: 'POST',
            body: JSON.stringify({ title, slug })
        });
    },

    updateCustomPageMetadata: async (pageId, metaTitle, metaDescription) => {
        return fetchWithAuth(`/website/custom-page/${pageId}/metadata`, {
            method: 'PUT',
            body: JSON.stringify({ metaTitle, metaDescription })
        });
    },

    deleteCustomPage: async (pageId) => {
        return fetchWithAuth(`/website/custom-page/${pageId}`, {
            method: 'DELETE'
        });
    },

    publishCustomPage: async (pageId) => {
        return fetchWithAuth(`/website/custom-page/${pageId}/publish`, {
            method: 'POST'
        });
    },

    unpublishCustomPage: async (pageId) => {
        return fetchWithAuth(`/website/custom-page/${pageId}/unpublish`, {
            method: 'POST'
        });
    },

    copyCustomPage: async (pageId) => {
        return fetchWithAuth(`/website/custom-page/${pageId}/copy`, {
            method: 'POST'
        });
    },

    resetCustomPage: async (pageId) => {
        return fetchWithAuth(`/website/custom-page/${pageId}/reset`, {
            method: 'POST'
        });
    },

    // Custom Page Sections
    addCustomPageSection: async (pageId, sectionType, config = '{}') => {
        return fetchWithAuth(`/website/custom-page/${pageId}/sections`, {
            method: 'POST',
            body: JSON.stringify({ sectionType, config })
        });
    },

    updateCustomPageSection: async (sectionId, config) => {
        return fetchWithAuth(`/website/custom-page/sections/${sectionId}`, {
            method: 'PUT',
            body: JSON.stringify({ config })
        });
    },

    reorderCustomPageSections: async (pageId, orderedIds) => {
        return fetchWithAuth(`/website/custom-page/${pageId}/sections/order`, {
            method: 'PUT',
            body: JSON.stringify(orderedIds)
        });
    },

    deleteCustomPageSection: async (sectionId) => {
        return fetchWithAuth(`/website/custom-page/sections/${sectionId}`, {
            method: 'DELETE'
        });
    },

    getCustomPageBuilder: async (pageId) => {
        return fetchWithAuth(`/website/custom-page/${pageId}/builder`);
    },

    saveCustomPage: async (pageId) => {
        return fetchWithAuth(`/website/custom-page/${pageId}/save`, {
            method: 'PUT'
        });
    },

    previewCustomPage: async (pageId) => {
        return fetchWithAuth(`/website/custom-page/${pageId}/preview`);
    },

    getPublicPage: async (slug) => {
        // Backend usually has a public endpoint for the live view
        return fetchWithAuth(`/website/store/s/pages/${slug.replace(/^\//, '')}`);
    }
};
