import api from "./api";

 * Lead API Service
 */
export const leadService = {
  createLead: async (data) => {
    console.log("[LeadService] --- Local Submission ---");
    
    // Map Frontend fields to Backend CreateLeadRequest schema
    const payload = {
      name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
      mobile: data.phone,
      email: data.email,
      courseId: data.courseId,
      batchId: data.batchId,
      referralCode: data.referralCode || ""
    };

    console.log("[LeadService] Payload:", JSON.stringify(payload, null, 2));

    try {
      console.log("[LeadService] Submitting to Lead Service...");
      const response = await api.post("/leads", payload);
      console.log("[LeadService] Success:", response);
      return response;
    } catch (err) {
      console.error("[LeadService] Failed:", err.message);
      throw err;
    }
  }
};
