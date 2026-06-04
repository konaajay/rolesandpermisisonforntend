import { authFetch, getAuthToken } from '../utils/apiUtils';

/**
 * webinarService.js
 * Handles all backend API calls for the Webinar module.
 * Replaces the previous sessionStorage implementation.
 */

const BASE_URL = '/api/webinars';

export const webinarService = {
    /**
     * Fetch all webinars from the backend.
     * Optional: filter by type ('live', 'upcoming', 'recorded')
     */
    getAllWebinars: async (filter = 'all') => {
        try {
            let url = BASE_URL;
            if (filter !== 'all' && (filter === 'PAID' || filter === 'FREE')) {
                url = `${BASE_URL}?type=${filter}`;
            }
            
            console.log(`webinarService.getAllWebinars fetching: ${url}`);
            const response = await authFetch(url);
            
            if (!response.ok) {
                const errText = await response.text().catch(() => "Unknown error");
                console.error(`webinarService.getAllWebinars failed: ${response.status}`, errText);
                throw new Error(`Server error (${response.status}): ${errText}`);
            }
            
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('webinarService.getAllWebinars fatal error:', error);
            throw error;
        }
    },

    /**
     * Get a single webinar by ID.
     */
    getWebinarById: async (id) => {
        try {
            const response = await authFetch(`${BASE_URL}/${id}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch webinar details: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`webinarService.getWebinarById(${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Create a new webinar.
     */
    createWebinar: async (webinarData) => {
        try {
            console.log('webinarService.createWebinar sending payload:', JSON.stringify(webinarData, null, 2));
            const response = await authFetch(BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webinarData),
            });
            if (!response.ok) {
                const responseText = await response.text().catch(() => "No response body");
                let errorData = {};
                try {
                    errorData = JSON.parse(responseText);
                } catch (e) {
                    errorData = { message: responseText };
                }
                
                if (response.status === 500 && (errorData.message === 'Access Denied' || responseText.includes('Access Denied'))) {
                    console.error('%c🚀 BACKEND SECURITY / ACCESS DENIED ERROR 🚀', 'background: red; color: white; display: block; font-size: 16px; font-weight: bold; padding: 4px;');
                    console.error('%cThe frontend correctly sent the token, but Ganesh\'s server rejected it. \n\nTell Ganesh to check his Spring Boot Console right now! It is guaranteed to be one of these three issues locally on his machine: \n1. SignatureException (Mismatched jwt.secret compared to Santosh) \n2. Tenant DB missing (He doesn\'t have lms_tenant_1770701101086 created) \n3. The PreAuthorize bug (He used hasAuthority("ADMIN") instead of expecting "ROLE_ADMIN").', 'font-size: 14px; color: #ff3333; font-weight: bold;');
                } else {
                    console.error('webinarService.createWebinar error response:', {
                        status: response.status,
                        statusText: response.statusText,
                        data: errorData
                    });
                }
                
                // Construct a detailed error string
                const detailedError = errorData.message || errorData.error || `Server Error ${response.status}`;
                const error = new Error(detailedError);
                error.status = response.status;
                error.data = errorData;
                throw error;
            }
            return await response.json();
        } catch (error) {
            console.error('webinarService.createWebinar error:', error);
            throw error;
        }
    },

    /**
     * Upload an image for a webinar.
     */
    uploadWebinarImage: async (id, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            // Use authFetch but we need to let it handle the form data correctly
            // Actually authFetch sets 'Content-Type': 'application/json' by default which we DON'T want for FormData
            // So we'll fetch manually with the token
            const token = getAuthToken();
            const response = await fetch(`${BASE_URL}/${id}/image`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to upload webinar image');
            }
            return true;
        } catch (error) {
            console.error('webinarService.uploadWebinarImage error:', error);
            throw error;
        }
    },

    /**
     * Delete a webinar by ID.
     */
    deleteWebinar: async (id) => {
        try {
            const response = await authFetch(`${BASE_URL}/${id}/hard`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`Failed to delete webinar: ${response.statusText}`);
            }
            return true;
        } catch (error) {
            console.error(`webinarService.deleteWebinar(${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Update a webinar (e.g., status changes).
     */
    updateWebinar: async (id, webinarData) => {
        try {
            const response = await authFetch(`${BASE_URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(webinarData),
            });
            if (!response.ok) {
                throw new Error(`Failed to update webinar: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`webinarService.updateWebinar(${id}) error:`, error);
            throw error;
        }
    },

    /**
     * Register a student for a webinar.
     * Uses Form-Data as required by backend.
     */
    registerStudent: async (webinarId, userId) => {
        try {
            const params = new URLSearchParams();
            params.append('webinarId', webinarId);
            if (userId) params.append('userId', userId);

            const response = await authFetch(`/api/webinar-registrations/student`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Registration failed' }));
                throw new Error(err.message || 'Failed to register student');
            }
            return await response.json();
        } catch (error) {
            console.error('webinarService.registerStudent error:', error);
            throw error;
        }
    },

    /**
     * Register an external participant for a webinar.
     * Uses Form-Data as required by backend.
     */
    registerExternal: async (webinarId, participantId) => {
        try {
            const params = new URLSearchParams();
            params.append('webinarId', webinarId);
            params.append('participantId', participantId);

            const response = await fetch(`/api/webinar-registrations/external`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });
            if (!response.ok) {
                const err = await response.json().catch(() => ({ message: 'Registration failed' }));
                throw new Error(err.message || 'Failed to register external participant');
            }
            return await response.json();
        } catch (error) {
            console.error('webinarService.registerExternal error:', error);
            throw error;
        }
    },

    /**
     * Create an external participant record.
     */
    createExternalParticipant: async (participantData) => {
        try {
            const response = await fetch(`/api/external-participants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(participantData)
            });
            if (!response.ok) {
                throw new Error('Failed to create participant profile');
            }
            return await response.json();
        } catch (error) {
            console.error('webinarService.createExternalParticipant error:', error);
            throw error;
        }
    },


    /**
     * Mark attendance for a webinar.
     * POST /api/webinar-attendance/mark
     */
    markAttendance: async (registrationId, status = 'PRESENT', mode = 'ONLINE') => {
        try {
            const params = new URLSearchParams();
            params.append('registrationId', registrationId);
            params.append('status', status);
            params.append('mode', mode);

            const response = await authFetch(`/api/webinar-attendance/mark`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString()
            });
            if (!response.ok) {
                throw new Error('Failed to mark attendance');
            }
            return await response.json();
        } catch (error) {
            console.error('webinarService.markAttendance error:', error);
            throw error;
        }
    },

    // --- Chat APIs ---
    sendChatMessage: async (chatData) => {
        const response = await authFetch(`/api/webinar-chat/send`, {
            method: 'POST',
            body: JSON.stringify(chatData)
        });
        return response.json();
    },

    getWebinarChat: async (webinarId) => {
        const response = await authFetch(`/api/webinar-chat/webinar/${webinarId}`);
        return response.json();
    },

    // --- Poll APIs ---
    createPoll: async (pollData) => {
        const response = await authFetch(`/api/webinar-polls`, {
            method: 'POST',
            body: JSON.stringify(pollData)
        });
        return response.json();
    },

    updatePollStatus: async (pollId, status) => {
        const response = await authFetch(`/api/webinar-polls/${pollId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
        return response.json();
    },

    getWebinarPolls: async (webinarId) => {
        const response = await authFetch(`/api/webinar-polls/webinar/${webinarId}`);
        return response.json();
    },

    voteInPoll: async (pollId, selectedOption, userId) => {
        const response = await authFetch(`/api/webinar-polls/${pollId}/respond`, {
            method: 'POST',
            body: JSON.stringify({ selectedOption, userId })
        });
        return response.json();
    },

    // --- Q&A APIs ---
    askQuestion: async (questionData) => {
        const response = await authFetch(`/api/webinar-questions/ask`, {
            method: 'POST',
            body: JSON.stringify(questionData)
        });
        return response.json();
    },

    answerQuestion: async (questionId, answer) => {
        const response = await authFetch(`/api/webinar-questions/${questionId}/answer`, {
            method: 'PUT',
            body: JSON.stringify({ answer })
        });
        return response.json();
    },

    getWebinarQuestions: async (webinarId) => {
        const response = await authFetch(`/api/webinar-questions/webinar/${webinarId}`);
        return response.json();
    },

    // --- Recording APIs ---
    uploadRecording: async (formData) => {
        const token = getAuthToken();
        const response = await fetch(`/api/webinar-recordings`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        return response.json();
    },

    getWebinarRecordings: async (webinarId) => {
        const response = await authFetch(`/api/webinar-recordings/webinar/${webinarId}`);
        return response.json();
    }

};
