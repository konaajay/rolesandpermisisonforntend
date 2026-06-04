import axios from 'axios';

const API_BASE_URL = '/api/transport';

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Create axios instance with interceptors
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
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

// ============================================
// VEHICLE MANAGEMENT
// ============================================

export const getAllVehicles = async () => {
    try {
        const response = await apiClient.get('/vehicles');
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        throw error;
    }
};

export const createVehicle = async (vehicleData) => {
    try {
        const response = await apiClient.post('/vehicles', vehicleData);
        return response.data;
    } catch (error) {
        console.error('Error creating vehicle:', error);
        throw error;
    }
};

export const updateVehicle = async (id, vehicleData) => {
    try {
        const response = await apiClient.put(`/vehicles/${id}`, vehicleData);
        return response.data;
    } catch (error) {
        console.error('Error updating vehicle:', error);
        throw error;
    }
};

export const deleteVehicle = async (id) => {
    try {
        const response = await apiClient.delete(`/vehicles/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        throw error;
    }
};

// ============================================
// ROUTE MANAGEMENT
// ============================================

export const getAllRoutes = async () => {
    try {
        const response = await apiClient.get('/routes');
        return response.data;
    } catch (error) {
        console.error('Error fetching routes:', error);
        throw error;
    }
};

export const createRoute = async (routeData) => {
    try {
        const response = await apiClient.post('/routes', routeData);
        return response.data;
    } catch (error) {
        console.error('Error creating route:', error);
        throw error;
    }
};

export const updateRoute = async (id, routeData) => {
    try {
        const response = await apiClient.put(`/routes/${id}`, routeData);
        return response.data;
    } catch (error) {
        console.error('Error updating route:', error);
        throw error;
    }
};

export const deleteRoute = async (id) => {
    try {
        const response = await apiClient.delete(`/routes/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting route:', error);
        throw error;
    }
};

// ============================================
// DRIVER MANAGEMENT
// ============================================

export const getAllDrivers = async () => {
    try {
        const response = await apiClient.get('/drivers');
        return response.data;
    } catch (error) {
        console.error('Error fetching drivers:', error);
        throw error;
    }
};

export const createDriver = async (driverData) => {
    try {
        const response = await apiClient.post('/drivers', driverData);
        return response.data;
    } catch (error) {
        console.error('Error creating driver:', error);
        throw error;
    }
};

export const updateDriver = async (id, driverData) => {
    try {
        const response = await apiClient.put(`/drivers/${id}`, driverData);
        return response.data;
    } catch (error) {
        console.error('Error updating driver:', error);
        throw error;
    }
};

export const deleteDriver = async (id) => {
    try {
        const response = await apiClient.delete(`/drivers/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting driver:', error);
        throw error;
    }
};

// ============================================
// STUDENT MAPPING (BUS ASSIGNMENT)
// ============================================

export const getStudentTransportMappings = async () => {
    try {
        const response = await apiClient.get('/assignments');
        return response.data;
    } catch (error) {
        console.error('Error fetching student mappings:', error);
        throw error;
    }
};

export const assignStudentToBus = async (mappingData) => {
    try {
        // Transform payload to match StudentTransportAssignment Entity
        const payload = {
            studentId: mappingData.studentId,
            vehicle: { id: mappingData.vehicleId }, // Backend expects Vehicle entity object
            pickupPoint: mappingData.pickupPoint,
            dropPoint: mappingData.dropPoint,
            shift: mappingData.shift
            // route: { id: ... } // Route is optional or inferred
        };
        const response = await apiClient.post('/assignments', payload);
        return response.data;
    } catch (error) {
        console.error('Error assigning student to bus:', error);
        throw error;
    }
};

export const deleteAssignment = async (id) => {
    try {
        const response = await apiClient.delete(`/assignments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting assignment:', error);
        throw error;
    }
};

// ============================================
// FUEL MANAGEMENT
// ============================================

export const getFuelLogs = async () => {
    try {
        const response = await apiClient.get('/fuel');
        return response.data;
    } catch (error) {
        console.error('Error fetching fuel logs:', error);
        throw error;
    }
};

export const getFuelLogsByVehicle = async (vehicleId) => {
    try {
        const response = await apiClient.get(`/fuel/vehicle/${vehicleId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching fuel logs by vehicle:', error);
        throw error;
    }
};

export const addFuelLog = async (logData) => {
    try {
        const response = await apiClient.post('/fuel', logData);
        return response.data;
    } catch (error) {
        console.error('Error adding fuel log:', error);
        throw error;
    }
};

export const updateFuelLog = async (id, logData) => {
    try {
        const response = await apiClient.put(`/fuel/${id}`, logData);
        return response.data;
    } catch (error) {
        console.error('Error updating fuel log:', error);
        throw error;
    }
};

export const deleteFuelLog = async (id) => {
    try {
        const response = await apiClient.delete(`/fuel/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting fuel log:', error);
        throw error;
    }
};

// ============================================
// MAINTENANCE MANAGEMENT
// ============================================

export const getAllMaintenance = async () => {
    try {
        const response = await apiClient.get('/maintenance');
        return response.data;
    } catch (error) {
        console.error('Error fetching maintenance:', error);
        throw error;
    }
};

export const getMaintenanceByVehicle = async (vehicleId) => {
    try {
        const response = await apiClient.get(`/maintenance/vehicle/${vehicleId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching maintenance by vehicle:', error);
        throw error;
    }
};

export const addMaintenance = async (data) => {
    try {
        const response = await apiClient.post('/maintenance', data);
        return response.data;
    } catch (error) {
        console.error('Error adding maintenance:', error);
        throw error;
    }
};

export const updateMaintenance = async (id, data) => {
    try {
        const response = await apiClient.put(`/maintenance/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating maintenance:', error);
        throw error;
    }
};

export const patchMaintenance = async (id, data) => {
    try {
        const response = await apiClient.patch(`/maintenance/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error patching maintenance:', error);
        throw error;
    }
};

export const deleteMaintenance = async (id) => {
    try {
        const response = await apiClient.delete(`/maintenance/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting maintenance:', error);
        throw error;
    }
};

// ============================================
// STUDENT MANAGEMENT
// ============================================

export const getAllStudents = async () => {
    try {
        const token = getAuthToken();
        // Fetch from Admin/Student Service, not Transport Service
        const response = await axios.get('/admin/getstudents', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching students:', error);
        throw error;
    }
};

export const updateStudent = async (id, studentData) => {
    try {
        const response = await apiClient.put(`/students/${id}`, studentData);
        return response.data;
    } catch (error) {
        console.error('Error updating student:', error);
        throw error;
    }
};
// ============================================
// LIVE TRACKING (GPS)
// ============================================

export const sendGpsData = async (vehicleId, lat, lng, speed) => {
    try {
        // Backend expects query params: ?vehicleId=1&latitude=...
        const response = await apiClient.post(`/gps`, null, {
            params: { vehicleId, latitude: lat, longitude: lng, speed }
        });
        return response.data;
    } catch (error) {
        console.error('Error sending GPS data:', error);
        throw error;
    }
};

export const getLatestLocation = async (vehicleId) => {
    try {
        const response = await apiClient.get(`/gps/latest/${vehicleId}`);
        return response.data;
    } catch (error) {
        // Backend returns 500 if no data exists (e.g. RuntimeException("No GPS Data Found"))
        // We treat this as "no location yet" rather than a system failure
        if (error.response && [404, 500].includes(error.response.status)) {
            return null;
        }
        console.warn('Error fetching latest location:', error.message);
        throw error;
    }
};

export const getVehicleHistory = async (vehicleId) => {
    try {
        const response = await apiClient.get(`/gps/history/${vehicleId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vehicle history:', error);
        throw error;
    }
};
// ============================================
// ATTENDANCE
// ============================================

export const getAttendance = async (date, routeId) => {
    try {
        // Backend currently returns ALL attendance (no filtering params supported yet)
        const response = await apiClient.get('/attendances');
        return response.data;
    } catch (error) {
        console.error('Error fetching attendance:', error);
        throw error;
    }
};

export const markAttendance = async (attendanceData) => {
    try {
        const response = await apiClient.post('/attendance', attendanceData);
        return response.data;
    } catch (error) {
        console.error('Error marking attendance:', error);
        throw error;
    }
};

export const updateAttendance = async (id, attendanceData) => {
    try {
        const response = await apiClient.put(`/attendance/${id}`, attendanceData);
        return response.data;
    } catch (error) {
        console.error('Error updating attendance:', error);
        throw error;
    }
};

export const deleteAttendance = async (id) => {
    try {
        const response = await apiClient.delete(`/attendance/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting attendance:', error);
        throw error;
    }
};

// ============================================
// FEE MANAGEMENT
// ============================================

export const createFeeStructure = async (data) => {
    try {
        const response = await apiClient.post('/fee-structure', data);
        return response.data;
    } catch (error) {
        console.error('Error creating fee structure:', error);
        throw error;
    }
};

export const getAllFeeStructures = async () => {
    try {
        const response = await apiClient.get('/fee-structure');
        return response.data;
    } catch (error) {
        console.error('Error fetching fee structures:', error);
        throw error;
    }
};

export const getMyRouteFee = async () => {
    try {
        const response = await apiClient.get('/fee-structure/my');
        return response.data;
    } catch (error) {
        console.error('Error fetching my route fee:', error);
        throw error;
    }
};

export const updateFeeStructure = async (id, data) => {
    try {
        const response = await apiClient.put(`/fee-structure/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating fee structure:', error);
        throw error;
    }
};

export const deleteFeeStructure = async (id) => {
    try {
        const response = await apiClient.delete(`/fee-structure/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting fee structure:', error);
        throw error;
    }
};

// ============================================
// PAYMENTS
// ============================================

export const addPayment = async (data) => {
    try {
        const response = await apiClient.post('/payments', data);
        return response.data;
    } catch (error) {
        console.error('Error adding payment:', error);
        throw error;
    }
};

export const getAllPayments = async () => {
    try {
        const response = await apiClient.get('/payments');
        return response.data;
    } catch (error) {
        console.error('Error fetching payments:', error);
        throw error;
    }
};

export const getMyPayments = async () => {
    try {
        const response = await apiClient.get('/payments/my');
        return response.data;
    } catch (error) {
        console.error('Error fetching my payments:', error);
        throw error;
    }
};

export const getChildPayments = async (studentId) => {
    try {
        const response = await apiClient.get(`/payments/child/${studentId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching child payments:', error);
        throw error;
    }
};

export const deletePayment = async (id) => {
    try {
        const response = await apiClient.delete(`/payments/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting payment:', error);
        throw error;
    }
};

// ============================================
// SETTINGS
// ============================================

export const saveSetting = async (data) => {
    try {
        const response = await apiClient.post('/settings', data);
        return response.data;
    } catch (error) {
        console.error('Error saving setting:', error);
        throw error;
    }
};

export const getAllSettings = async () => {
    try {
        const response = await apiClient.get('/settings');
        return response.data;
    } catch (error) {
        console.error('Error fetching settings:', error);
        throw error;
    }
};

export default {
    Vehicle: {
        getAllVehicles,
        addVehicle: createVehicle,
        updateVehicle,
        deleteVehicle
    },
    Route: {
        getAllRoutes,
        createRoute,
        updateRoute,
        deleteRoute
    },
    Driver: {
        getAllDrivers,
        addDriver: createDriver,
        updateDriver,
        deleteDriver
    },
    Student: {
        getAllStudents,
        updateStudent,
        getStudentTransportMappings,
        assignStudentToBus,
        deleteAssignment
    },
    Fuel: {
        getFuelLogs,
        getFuelLogsByVehicle,
        addFuelLog,
        updateFuelLog,
        deleteFuelLog
    },
    Maintenance: {
        getAllMaintenance,
        getMaintenanceByVehicle,
        addMaintenance,
        updateMaintenance,
        patchMaintenance,
        deleteMaintenance
    },
    Attendance: {
        getAttendance,
        markAttendance,
        updateAttendance,
        deleteAttendance
    },
    Tracking: {
        sendGpsData,
        getLatestLocation,
        getVehicleHistory
    },
    FeeStructure: {
        create: createFeeStructure,
        getAll: getAllFeeStructures,
        getMyFee: getMyRouteFee,
        update: updateFeeStructure,
        delete: deleteFeeStructure
    },
    Payments: {
        add: addPayment,
        getAll: getAllPayments,
        getMyPayments,
        getChildPayments,
        delete: deletePayment
    },
    Settings: {
        save: saveSetting,
        getAll: getAllSettings
    }
};
