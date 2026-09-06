import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { rut, contact } = await req.json();

    if (!rut || !contact) {
      return new Response(
        JSON.stringify({ success: false, error: "Faltan datos requeridos." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validar identidad via RPC
    const { data, error } = await supabase.rpc("balandra_request_pin_reset", {
      p_rut: rut,
      p_contact: contact,
    });

    if (error || !data?.success) {
      return new Response(
        JSON.stringify({ success: false, error: data?.error || "Error al validar identidad." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generar código de 6 dígitos
    const token = String(Math.floor(100000 + Math.random() * 900000));

    // Guardar token en la BD via RPC
    await supabase.rpc("balandra_store_pin_token", {
      p_rut: data.rut_norm,
      p_token: token,
    });

    // Enviar email via SMTP usando fetch a un relay simple
    const smtpUser = Deno.env.get("SMTP_USER")!;
    const smtpPass = Deno.env.get("SMTP_PASS")!;
    const smtpHost = Deno.env.get("SMTP_HOST") || "mail.radissonpuertovaras.cl";

    // Usar la API de envío SMTP via nodemailer compatible con Deno
    const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: 465,
        tls: true,
        auth: { username: smtpUser, password: smtpPass },
      },
    });

    await client.send({
      from: `"Restaurante Balandra" <${smtpUser}>`,
      to: data.owner_email,
      subject: "Código de recuperación · Ticketera Balandra",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px">
          <p style="font-size:12px;color:#888;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Restaurante Balandra · Radisson Puerto Varas</p>
          <h2 style="color:#0a1628;margin-bottom:16px">Recuperación de PIN</h2>
          <p style="color:#444;margin-bottom:24px">Hola <strong>${data.owner_name}</strong>, recibimos una solicitud para cambiar el PIN de tu Ticketera Balandra.</p>
          <p style="color:#444;margin-bottom:8px">Tu código de verificación es:</p>
          <div style="background:#0a1628;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
            <span style="font-size:36px;font-weight:700;letter-spacing:12px;color:#D4AF37;font-family:monospace">${token}</span>
          </div>
          <p style="color:#888;font-size:13px">Este código expira en <strong>10 minutos</strong>. Si no solicitaste este cambio, ignora este correo — tu PIN no será modificado.</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
          <p style="color:#aaa;font-size:11px">Restaurante Balandra · Radisson Hotel Puerto Varas</p>
        </div>
      `,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, email_mask: data.email_mask }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("send-pin-recovery error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Error interno al enviar el correo." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
