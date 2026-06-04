import { userService } from '../../Users/services/userService';
import { courseService } from '../../Courses/services/courseService';
import { batchService } from '../../Batches/services/batchService';
import { sessionService } from '../../Batches/services/sessionService';
import { attendanceService } from '../../Attendance/services/attendanceService';

export const dashboardService = {
    // 1. Global Summary
    getGlobalStats: async () => {
        try {
            const [users, courses, batches] = await Promise.all([
                userService.getAllUsers().catch(() => []),
                courseService.getCourses().catch(() => []),
                batchService.getAllBatches().catch(() => [])
            ]);

            const students = users.filter(u =>
                (u.role || u.roleName || '').toUpperCase().includes('STUDENT')
            );

            // Calculate active sessions count (approximate logic for now)
            // Real logic would require fetching all sessions for all batches, which might be heavy.
            // For now, let's return placeholders or implement a lighter check if possible.
            // We'll mock "Active Sessions" for performance unless we want to iterate all batches.

            return {
                totalStudents: students.length,
                totalCourses: courses.length,
                totalBatches: batches.length,
                activeSessions: 0, // Filled later via getLiveSessions
                attendancePercent: 0, // Filled via getAttendanceStats
                atRiskCount: 5 // Mock for now or derive
            };
        } catch (error) {
            console.error("Dashboard Stats Error:", error);
            return {
                totalStudents: 0,
                totalCourses: 0,
                totalBatches: 0,
                activeSessions: 0,
                attendancePercent: 0,
                atRiskCount: 0
            };
        }
    },

    // 2. Live / Upcoming Sessions
    getTodaysSessions: async () => {
        try {
            // Ideally backend has "getSessionsByDate". 
            // If not, we might scan active batches.
            const batches = await batchService.getAllBatches();
            const today = new Date().toISOString().split('T')[0];

            // Filter batches that are active today
            const activeBatches = batches.filter(b =>
                b.startDate <= today && b.endDate >= today
            );

            // Fetch sessions for these batches (Parallel limit recommended normally)
            const sessionPromises = activeBatches.map(b =>
                sessionService.getSessionsByBatchId(b.batchId).catch(() => [])
            );

            const results = await Promise.all(sessionPromises);
            const allSessions = results.flat();

            // Filter for Today
            const todaysSessions = allSessions.filter(s => s.startDate === today);

            // Determine Status (Live/Upcoming/Closed)
            const now = new Date();
            const enriched = todaysSessions.map(s => {
                const start = new Date(`${s.startDate}T${s.startTime}`);
                const end = new Date(start.getTime() + (s.durationMinutes || 60) * 60000);

                let status = 'UPCOMING';
                if (now >= start && now <= end) status = 'LIVE';
                else if (now > end) status = 'CLOSED';

                return { ...s, status, endTime: end };
            });

            return enriched.sort((a, b) => new Date(`${a.startDate}T${a.startTime}`) - new Date(`${b.startDate}T${b.startTime}`));
        } catch (error) {
            console.error("Live Sessions Error:", error);
            return [];
        }
    },

    // 3. Attendance Snapshot (Mock for now as aggregate API likely missing)
    getAttendanceStats: async () => {
        // Return dummy data structure for the UI
        return {
            present: 85,
            absent: 12,
            late: 3,
            offlinePending: 2, // Count of batches awaiting upload
        };
    },

    // 4. Alerts (Mock/Logic)
    getAlerts: async () => {
        return [
            { id: 1, type: 'CRITICAL', message: "3 Students below 60% attendance eligibility.", link: '/attendance/reports' },
            { id: 2, type: 'WARNING', message: "Upload failed: Batch #102 Offline Data", link: '/attendance/offline' },
            { id: 3, type: 'INFO', message: "Consolidated Report ready for download.", link: '/reports' }
        ];
    },

    // 5. Recent Activity
    getActivityLog: async () => {
        return [
            { id: 1, text: "Session 'React Basics' started", time: "10 mins ago", user: "System" },
            { id: 2, text: "Offline CSV uploaded (32 records)", time: "1 hour ago", user: "Admin" },
            { id: 3, text: "New Student 'Rahul' enrolled in Batch 7", time: "2 hours ago", user: "Registrar" },
            { id: 4, text: "Course 'Java Advanced' published", time: "yesterday", user: "Manager" }
        ];
    }
};
