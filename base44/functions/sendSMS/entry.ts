import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Uses OpenAI API key already configured, but SMS requires Twilio
// This function sends SMS via Twilio if configured, or returns instructions
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { to, message } = await req.json();
    if (!to || !message) return Response.json({ error: 'Paramètres manquants: to, message' }, { status: 400 });

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      return Response.json({
        error: "Twilio non configuré",
        setup_required: true,
        instructions: "Ajoutez TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN et TWILIO_FROM_NUMBER dans les secrets."
      }, { status: 503 });
    }

    const credentials = btoa(`${accountSid}:${authToken}`);
    const body = new URLSearchParams({ To: to, From: fromNumber, Body: message });

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    const data = await response.json();
    if (!response.ok) return Response.json({ error: data.message || "Erreur Twilio" }, { status: 500 });

    return Response.json({ success: true, sid: data.sid });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});