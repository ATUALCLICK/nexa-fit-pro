// Supabase Edge Function: lastlink-webhook
// Endpoint: https://zebunzuydwsudexdvmhu.supabase.co/functions/v1/lastlink-webhook
// Token de Validação: 9af28bbe1fea4c16a2e4f860e2b388cd

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8"

const LASTLINK_SECRET_TOKEN = "9af28bbe1fea4c16a2e4f860e2b388cd"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-lastlink-token, token",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS"
}

// Mapeamento dos Códigos de Produtos da LastLink para Planos Nexa Fit
const PRODUCT_MAP: Record<string, { id: string; name: string; days: number }> = {
  // 1 Mês (30 dias)
  "C29E63DD9": { id: "1m", name: "Plano Mensal (30 dias)", days: 30 },
  // 6 Meses (180 dias)
  "CD478083B": { id: "6m", name: "Plano Semestral (180 dias)", days: 180 },
  // 12 Meses (365 dias)
  "C3DFDBF21": { id: "12m", name: "Plano Anual Completo (365 dias)", days: 365 }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const tokenQuery = url.searchParams.get("token")
    const tokenHeader = req.headers.get("x-lastlink-token") || req.headers.get("token") || req.headers.get("authorization")?.replace("Bearer ", "")

    // Parse Body
    let body: any = {}
    try {
      body = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // Validação de Token de Segurança
    const receivedToken = tokenHeader || tokenQuery || body.token || body.secret
    if (receivedToken && receivedToken !== LASTLINK_SECRET_TOKEN) {
      console.warn("Unauthorized webhook attempt with token:", receivedToken)
      return new Response(JSON.stringify({ error: "Unauthorized token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    console.log("LastLink Webhook payload received:", JSON.stringify(body))

    // Identificação do Evento
    const eventType = (body.event || body.type || body.status || body.event_name || "venda-aprovada").toString().toLowerCase()

    // Extração dos dados do comprador
    const buyerEmail = (
      body.buyer?.email ||
      body.customer?.email ||
      body.client?.email ||
      body.data?.buyer?.email ||
      body.data?.customer?.email ||
      body.email ||
      ""
    ).toString().toLowerCase().trim()

    const buyerName = (
      body.buyer?.name ||
      body.customer?.name ||
      body.client?.name ||
      body.data?.buyer?.name ||
      body.data?.customer?.name ||
      body.name ||
      buyerEmail.split("@")[0] ||
      "Aluno Nexa Fit"
    ).toString().trim()

    // Identificação do Produto / Plano
    const rawProductId = (
      body.product?.id ||
      body.product?.code ||
      body.product_id ||
      body.productId ||
      body.data?.product?.id ||
      body.data?.product?.code ||
      body.offer_id ||
      body.offerCode ||
      ""
    ).toString().toUpperCase().trim()

    const planConfig = PRODUCT_MAP[rawProductId] || PRODUCT_MAP["C3DFDBF21"] // Default Anual
    const transactionId = body.transaction_id || body.order_id || body.id || `LL-${Date.now()}`

    if (!buyerEmail) {
      return new Response(JSON.stringify({ error: "No buyer email provided in payload", received: body }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    // Inicializa Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://zebunzuydwsudexdvmhu.supabase.co"
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "sb_publishable_wLYMf9X2A5nDtdR3kcT87g_z8FUpseM"
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Eventos de Cancelamento ou Reembolso
    const isCancelled = eventType.includes("cancel") || eventType.includes("reembols") || eventType.includes("estorno") || eventType.includes("refund")

    const now = new Date()
    const purchasedAt = now.toISOString()
    const expiresDate = new Date()
    expiresDate.setDate(expiresDate.getDate() + (isCancelled ? -1 : planConfig.days))
    const expiresAt = expiresDate.toISOString()

    const subscriptionRecord = {
      email: buyerEmail,
      name: buyerName,
      planId: planConfig.id,
      planName: planConfig.name,
      productId: rawProductId,
      durationDays: planConfig.days,
      purchasedAt,
      expiresAt,
      status: isCancelled ? "refunded" : "paid",
      transactionId,
      source: "lastlink",
      updatedAt: purchasedAt
    }

    // 1. Atualiza ou cria na tabela 'profiles'
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .upsert({
        email: buyerEmail,
        nome: buyerName,
        daily_logs: {
          subscription: subscriptionRecord,
          updated_at: purchasedAt
        }
      }, { onConflict: "email" })
      .select()

    if (profileErr) {
      console.error("Error upserting profile:", profileErr)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: isCancelled ? "Access revoked successfully" : "Access granted successfully",
        email: buyerEmail,
        plan: planConfig.name,
        expiresAt,
        status: subscriptionRecord.status
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  } catch (error: any) {
    console.error("Webhook processing error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
