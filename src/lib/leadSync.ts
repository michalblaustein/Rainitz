/**
 * Helper to submit lead details to the backend API which
 * synchronizes them to Plando and sends an email notification.
 */
export async function syncLeadToBackend(leadData: {
  name: string;
  phone: string;
  email: string;
  message?: string;
  source: string;
  tag?: string;
  details?: Record<string, any>;
}) {
  try {
    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(leadData),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error in syncLeadToBackend:", error);
    return { success: false, error };
  }
}
