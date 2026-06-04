import api from "./api";

/**
 * Lead API Service (v36) - Single Submission
 * Targeting Local Affiliate Service directly
 */
export const leadService = {
  createLead: async (data) => {
    console.log("[LeadService] --- Local Affiliate Submission (v36) ---");
    
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

    // Endpoint: /api/affiliates/lead
    try {
      console.log("[LeadService] Submitting to Affiliate Service (Auth-Free)...");
      const response = await api.post("/api/affiliates/lead", payload, {
        headers: {
          // Force empty Authorization to bypass strict Tomcat 10 header checks
          // in case a malformed token exists in localStorage
          "Authorization": "" 
        }
      });
      console.log("[LeadService] Success:", response);
      return response;
    } catch (err) {
      console.error("[LeadService] Failed:", err.message);
      throw err;
    }
  }
};
