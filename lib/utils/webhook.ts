import { createClient } from "@/lib/supabase/client";
import type { FreeMaterial } from "@/lib/types/database";

export interface WebhookPayload {
  lead: {
    full_name: string;
    email: string;
    whatsapp: string;
  };
  material: {
    material_id: string;
    material_name: string;
    email_content: string;
    thank_you_content: string;
  };
  timestamp: string;
}

export interface WebhookResponse {
  success: boolean;
  status?: number;
  body?: string;
  error?: string;
}

/**
 * Send webhook with lead and material information
 * @param webhookUrl - The URL to send the webhook to
 * @param payload - The data to send
 * @returns Promise with webhook response details
 */
export async function sendWebhook(
  webhookUrl: string,
  payload: WebhookPayload
): Promise<WebhookResponse> {
  try {
    console.log("🚀 Sending webhook to:", webhookUrl);
    console.log("📦 Payload:", JSON.stringify(payload, null, 2));

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    
    console.log("✅ Webhook response status:", response.status);
    console.log("📥 Webhook response body:", responseText);

    return {
      success: response.ok,
      status: response.status,
      body: responseText,
    };
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Log webhook attempt to database
 * @param leadId - The ID of the lead
 * @param materialId - The ID of the material (optional)
 * @param webhookUrl - The webhook URL that was called
 * @param payload - The payload that was sent
 * @param response - The response from the webhook
 */
export async function logWebhook(
  leadId: string,
  materialId: string | null,
  webhookUrl: string,
  payload: WebhookPayload,
  response: WebhookResponse
): Promise<void> {
  try {
    const supabase = createClient();

    const { error } = await supabase.from("webhook_logs").insert({
      lead_id: leadId,
      material_id: materialId,
      webhook_url: webhookUrl,
      payload: payload as any,
      response_status: response.status || null,
      response_body: response.body || null,
      error_message: response.error || null,
      sent_at: new Date().toISOString(),
    });

    if (error) {
      console.error("❌ Error logging webhook:", error);
    } else {
      console.log("✅ Webhook logged successfully");
    }
  } catch (error) {
    console.error("❌ Error in logWebhook:", error);
  }
}

/**
 * Send webhook and log the attempt
 * This is the main function to use for webhook integration
 * Uses a fixed Railway webhook endpoint
 * @param leadData - Lead information
 * @param material - Material information
 * @param leadId - The ID of the created lead
 * @returns Promise with webhook response
 */
export async function sendAndLogWebhook(
  leadData: {
    full_name: string;
    email: string;
    whatsapp: string;
  },
  material: FreeMaterial,
  leadId: string
): Promise<WebhookResponse> {
  // Fixed Railway webhook endpoint
  const webhookUrl = "https://primary-production-4ada.up.railway.app/webhook-test/8b0186e8-2663-4c57-9e19-837218c3fafb";

  // Prepare the payload
  const payload: WebhookPayload = {
    lead: {
      full_name: leadData.full_name,
      email: leadData.email,
      whatsapp: leadData.whatsapp,
    },
    material: {
      material_id: material.id,
      material_name: material.material_name,
      email_content: material.email_content,
      thank_you_content: material.thank_you_content,
    },
    timestamp: new Date().toISOString(),
  };

  // Send the webhook
  const response = await sendWebhook(webhookUrl, payload);

  // Log the webhook attempt (don't await to avoid blocking)
  logWebhook(leadId, material.id, webhookUrl, payload, response).catch(
    (error) => {
      console.error("Failed to log webhook:", error);
    }
  );

  return response;
}

/**
 * Send webhook to test endpoint
 * Used for testing the webhook integration
 *
 * Currently configured to send to Railway webhook endpoint
 */
export async function sendTestWebhook(
  leadData: {
    full_name: string;
    email: string;
    whatsapp: string;
  },
  material: FreeMaterial,
  leadId: string
): Promise<WebhookResponse> {
  // Railway webhook test endpoint
  const testWebhookUrl =
    "https://primary-production-4ada.up.railway.app/webhook-test/8b0186e8-2663-4c57-9e19-837218c3fafb";

  console.log("🚀 USING RAILWAY WEBHOOK URL:", testWebhookUrl);

  const payload: WebhookPayload = {
    lead: {
      full_name: leadData.full_name,
      email: leadData.email,
      whatsapp: leadData.whatsapp,
    },
    material: {
      material_id: material.id,
      material_name: material.material_name,
      email_content: material.email_content,
      thank_you_content: material.thank_you_content,
    },
    timestamp: new Date().toISOString(),
  };

  // Send to test endpoint
  const response = await sendWebhook(testWebhookUrl, payload);

  // Log the webhook attempt
  logWebhook(leadId, material.id, testWebhookUrl, payload, response).catch(
    (error) => {
      console.error("Failed to log webhook:", error);
    }
  );

  return response;
}

