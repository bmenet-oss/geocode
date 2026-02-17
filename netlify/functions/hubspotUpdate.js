// functions/hubspotUpdate.js
import fetch from "node-fetch";

export async function handler(event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const data = JSON.parse(event.body);
    const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;

    if (!data.email) {
      return { statusCode: 400, body: "Missing email" };
    }

    
    // Prepare HubSpot properties
    const properties = [
      { property: "risk_score", value: data.riskScore || "" },
      { property: "system_summary", value: data.systemSummary || "" },
      { property: "equipment_cost", value: data.equipment || "" },
      { property: "install_cost", value: data.install || "" },
      { property: "monitoring_cost", value: data.monitoring || "" },
      { property: "device_list", value: (data.devices || []).join(", ") },
      { property: "address", value: data.address || "" }
    ];

    // HubSpot API endpoint
    const url = `https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/${encodeURIComponent(data.email)}/?hapikey=${HUBSPOT_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ properties })
    });

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result })
    };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}
