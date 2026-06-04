import api from './api';

const BASE_RECORD_URL = '/api/attendance/record';
const BASE_SESSION_URL = '/api/attendance/session';
const BASE_CONFIG_URL = '/api/attendance/config';

export const attendanceService = {
    // ===============================
    // SESSIONS
    // ===============================
    startSession: async (sessionId, courseId, batchId, userId) => {
        const params = new URLSearchParams({ sessionId, courseId, batchId, userId });
        return await api.post(`${BASE_SESSION_URL}/start?${params}`);
    },

    endSession: async (attendanceSessionId) => {
        return await api.put(`${BASE_SESSION_URL}/${attendanceSessionId}/end`, null);
    },

    getSessionById: async (attendanceSessionId) => {
        const data = await api.get(`${BASE_SESSION_URL}/${attendanceSessionId}`);
        if (!data) return null;
        
        const batchId = data.batchId || data.batch_id || 
                        (data.session && (data.session.batchId || data.session.batch_id || data.session.batch?.id)) ||
                        (data.batch && (data.batch.id || data.batch.batchId));
                        
        const classId = data.classId || data.sessionId || data.session_id || 
                        (data.session && (data.session.id || data.session.sessionId));

        return {
            ...data,
            id: data.id || attendanceSessionId,
            batchId: batchId,
            classId: classId
        };
    },

    getActiveSession: async (sessionId) => {
        return await api.get(`${BASE_SESSION_URL}/active/${sessionId}`);
    },

    getActiveAndEndedSessions: async (sessionId) => {
        return await api.get(`${BASE_SESSION_URL}/session/${sessionId}/all`);
    },

    getSessionsByDate: async (date) => {
        return await api.get(`${BASE_SESSION_URL}/date/${date}`);
    },

    deleteSession: async (attendanceSessionId) => {
        return await api.delete(`${BASE_SESSION_URL}/${attendanceSessionId}`);
    },

    // ===============================
    // RECORDS
    // ===============================
    markAttendance: async (recordData) => {
        return await api.post(BASE_RECORD_URL, recordData);
    },

    markAttendanceBulk: async (recordsData) => {
        return await api.post(`${BASE_RECORD_URL}/bulk`, recordsData);
    },

    updateAttendanceRecord: async (attendanceRecordId, recordData) => {
        return await api.put(`${BASE_RECORD_URL}/${attendanceRecordId}`, recordData);
    },

    getRecordsBySession: async (attendanceSessionId) => {
        return await api.get(`${BASE_RECORD_URL}/session/${attendanceSessionId}`);
    },

    getAttendance: async (attendanceSessionId) => {
        return await api.get(`${BASE_RECORD_URL}/session/${attendanceSessionId}`);
    },

    getRecordsByDate: async (date) => {
        return await api.get(`${BASE_RECORD_URL}/date/${date}`);
    },

    getRecordsBySessionAndDate: async (attendanceSessionId, date) => {
        return await api.get(`${BASE_RECORD_URL}/session/${attendanceSessionId}/date/${date}`);
    },

    getStudentRecords: async (studentId) => {
        return await api.get(`${BASE_RECORD_URL}/student/${studentId}`);
    },

    deleteAttendanceRecord: async (attendanceRecordId) => {
        return await api.delete(`${BASE_RECORD_URL}/${attendanceRecordId}`);
    },

    markLeave: async (attendanceSessionId, studentId) => {
        const params = new URLSearchParams({ attendanceSessionId, studentId });
        return await api.post(`${BASE_RECORD_URL}/leave?${params}`);
    },

    getDashboardStatus: async (courseId, batchId) => {
        const params = new URLSearchParams({ courseId, batchId });
        return await api.get(`${BASE_RECORD_URL}/dashboard?${params}`);
    },

    saveToOfflineQueue: async (data) => {
        return await api.post(`${BASE_RECORD_URL}/offline`, data);
    },

    syncOfflineQueue: async () => {
        return await api.post(`${BASE_RECORD_URL}/sync`);
    },

    // ===============================
    // CONFIG
    // ===============================
    createConfig: async (configData) => {
        return await api.post(BASE_CONFIG_URL, configData);
    },

    getConfig: async (courseId, batchId) => {
        const params = new URLSearchParams({ courseId, batchId });
        return await api.get(`${BASE_CONFIG_URL}?${params}`);
    },

    updateConfig: async (configId, configData) => {
        return await api.put(`${BASE_CONFIG_URL}/${configId}`, configData);
    }
};
