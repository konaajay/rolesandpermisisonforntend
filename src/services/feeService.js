import { apiFetch } from './api';
import axios from 'axios';

const BASE_URL = '/api/v1/fee-management';
const getUrl = (endpoint) => `${BASE_URL}${endpoint}`;

/* ============================================
   FEE TYPES
============================================ */

export const getAllFeeTypes = () => apiFetch(getUrl('/fee-types'));

export const getActiveFeeTypes = () => apiFetch(getUrl('/fee-types/active'));

export const createFeeType = (feeTypeData) =>
    apiFetch(getUrl('/fee-types'), {
        method: 'POST',
        body: JSON.stringify(feeTypeData)
    });

export const updateFeeType = (id, data) =>
    apiFetch(getUrl(`/fee-types/${id}`), {
        method: 'PUT',
        body: JSON.stringify(data)
    });

export const deleteFeeType = (id) =>
    apiFetch(getUrl(`/fee-types/${id}`), {
        method: 'DELETE'
    });


/* ============================================
   FEE DISCOUNTS
============================================ */

export const createFeeDiscount = (discountData) =>
    apiFetch(getUrl('/fee-discounts'), {
        method: 'POST',
        body: JSON.stringify(discountData)
    });

export const getFeeDiscounts = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(getUrl(`/fee-discounts${query ? `?${query}` : ''}`));
};

export const deleteFeeDiscount = (discountId) =>
    apiFetch(getUrl(`/fee-discounts/${discountId}`), {
        method: 'DELETE'
    });


/* ============================================
   SETTINGS
============================================ */

export const getFeeSettings = () => apiFetch(getUrl('/settings'));

export const saveFeeSettings = (settings) =>
    apiFetch(getUrl('/settings'), {
        method: 'POST',
        body: JSON.stringify(settings)
    });


/* ============================================
   AUDIT LOGS
============================================ */

export const getAuditLogs = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(getUrl(`/audit-logs${query ? `?${query}` : ''}`));
};

export const createAuditLog = (logData) =>
    apiFetch(getUrl('/audit-logs'), {
        method: 'POST',
        body: JSON.stringify(logData)
    });


/* ============================================
   BATCH
============================================ */

export const getAllBatches = () => apiFetch(getUrl('/batches'));

export const getBatchesByCourse = (courseId) =>
    apiFetch(getUrl(`/batches/course/${courseId}`));


/* ============================================
   BULK ALLOCATION
============================================ */

export const createBulkAllocation = (bulkData) =>
    apiFetch(getUrl('/fee-allocations/bulk'), {
        method: 'POST',
        body: JSON.stringify(bulkData)
    });


/* ============================================
   STUDENTS
============================================ */

export const getAllStudents = () => apiFetch(getUrl('/students'));

export const getStudentById = (studentId) =>
    apiFetch(getUrl(`/student/${studentId}`));

export const getStudentsByBatch = (batchId) =>
    apiFetch(getUrl(`/batches/${batchId}/students`));


/* ============================================
   REFUNDS
============================================ */

export const getAllRefunds = () => apiFetch(getUrl('/refunds'));

export const createRefund = (refundData) =>
    apiFetch(getUrl('/refunds'), {
        method: 'POST',
        body: JSON.stringify(refundData)
    });

export const deleteRefund = (refundId) =>
    apiFetch(getUrl(`/refunds/${refundId}`), {
        method: 'DELETE'
    });

export const approveRefund = (refundId, approvedBy) =>
    apiFetch(getUrl(`/refunds/${refundId}/approve?approvedBy=${approvedBy}`), {
        method: 'POST'
    });

export const rejectRefund = (refundId, rejectedBy, reason) => {
    const params = new URLSearchParams({ rejectedBy, reason }).toString();
    return apiFetch(getUrl(`/refunds/${refundId}/reject?${params}`), {
        method: 'POST'
    });
};

export const getRefundsByAllocationId = (allocationId) =>
    apiFetch(getUrl(`/refunds/allocation/${allocationId}`));


/* ============================================
   REFUND RULES
============================================ */

export const getAllRefundRules = () => apiFetch(getUrl('/refund-rules'));

export const saveRefundRule = (ruleData) =>
    apiFetch(getUrl('/refund-rules'), {
        method: 'POST',
        body: JSON.stringify(ruleData)
    });

export const deleteRefundRule = (id) =>
    apiFetch(getUrl(`/refund-rules/${id}`), {
        method: 'DELETE'
    });


/* ============================================
   PAYMENTS
============================================ */

export const getAllPayments = () => apiFetch(getUrl('/payments'));

export const getPaymentsByStudent = (studentId) =>
    apiFetch(getUrl(`/payments/history/${studentId}`));

export const createPayment = (paymentData) =>
    apiFetch(getUrl('/payments'), {
        method: 'POST',
        body: JSON.stringify(paymentData)
    });

export const recordManualPayment = (params) => {
    const query = new URLSearchParams({
        ...params,
        manualDiscount: params.manualDiscount || 0
    }).toString();

    return apiFetch(getUrl(`/payments/record-manual?${query}`), {
        method: 'POST'
    });
};

export const syncPaymentStatus = (orderId) =>
    apiFetch(getUrl(`/payments/sync/${orderId}`), {
        method: 'POST'
    });

export const uploadScreenshot = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    // Explicitly using fetch here as in original, to avoid apiFetch's default behavior with FormData if any
    return fetch(getUrl('/payments/upload'), {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('auth_token')}`
        }
    }).then(res => res.json());
};

export const downloadReceipt = async (paymentId) => {
    try {
        const response = await axios.get(getUrl(`/payments/${paymentId}/receipt`), {
            responseType: 'blob',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token') || localStorage.getItem('auth_token')}`
            }
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `receipt_${paymentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Download failed', error);
        throw error;
    }
};


/* ============================================
   INSTALLMENTS
============================================ */

export const getAllInstallments = () =>
    apiFetch(getUrl('/installments/overdue'));

export const getStudentInstallments = (allocationId) =>
    apiFetch(getUrl(`/installments/${allocationId}`));

export const createInstallmentPlan = (allocationId, installments) =>
    apiFetch(getUrl(`/installments/student?allocationId=${allocationId}`), {
        method: 'POST',
        body: JSON.stringify(installments)
    });

export const createBatchInstallmentPlan = (batchId, installments, userIds, baseAmount, courseId, advancePayment, adminDiscount, additionalDiscount, gstRate) =>
    apiFetch(getUrl('/installments/batch'), {
        method: 'POST',
        body: JSON.stringify({
            batchId,
            courseId,
            userIds,
            installments,
            baseAmount,
            advancePayment,
            adminDiscount,
            additionalDiscount,
            gstRate
        })
    });

export const overrideInstallmentPlan = (allocationId, plans) =>
    apiFetch(getUrl(`/installments/override?allocationId=${allocationId}`), {
        method: 'POST',
        body: JSON.stringify(plans)
    });

export const extendInstallmentDueDate = (installmentId, newDueDate, reason) =>
    apiFetch(getUrl(`/installments/${installmentId}/extend`), {
        method: 'PUT',
        body: JSON.stringify({ newDueDate, reason })
    });

export const waiveLateFee = (penaltyId) =>
    apiFetch(getUrl(`/late-fee-penalties/waive/${penaltyId}`), {
        method: 'PUT'
    });


/* ============================================
   FEE STRUCTURES
============================================ */

export const createFee = (feeData) =>
    apiFetch(getUrl('/fee-structures'), {
        method: 'POST',
        body: JSON.stringify(feeData)
    });

export const createFeeAllocation = (allocationData) =>
    apiFetch(getUrl('/fee-allocations'), {
        method: 'POST',
        body: JSON.stringify(allocationData)
    });

export const getFeeAllocationsByBatch = (batchId) =>
    apiFetch(getUrl(`/fee-allocations/batch/${batchId}`));

export const getAllFeeAllocations = () =>
    apiFetch(getUrl('/fee-allocations'));

export const updateFeeAllocation = (id, data) =>
    apiFetch(getUrl(`/fee-allocations/${id}`), {
        method: 'PUT',
        body: JSON.stringify(data)
    });

export const getStudentFee = (userId) =>
    apiFetch(getUrl(`/fee-allocations/user/${userId}`));

export const getAllFeeStructures = () =>
    apiFetch(getUrl('/fee-structures'));


/* ============================================
   DASHBOARD
============================================ */

export const getDashboardStats = () =>
    apiFetch(getUrl('/dashboard/stats'));

export const getCollectionReport = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch(getUrl(`/reports/collection${query ? `?${query}` : ''}`));
};

export const redeemCoupon = (payload) =>
    apiFetch('/api/marketing/coupons/public/apply', {
        method: 'POST',
        body: JSON.stringify(payload)
    });

export const getStudentLedger = () => apiFetch('/api/v1/student/my-ledger');
