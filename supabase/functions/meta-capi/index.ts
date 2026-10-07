// supabase/functions/meta-capi/index.ts
// ================================================================
// NEXA FIT PRO — Meta Conversions API (CAPI) Edge Function
// ================================================================
// Recebe eventos do client-side e os encaminha para a API de
// Conversões da Meta, adicionando dados server-side como IP.
//
// Benefícios de enviar via servidor:
// - Token de acesso fica seguro (não exposto no browser)
// - Captura client_ip_address real (via headers)
// - Redundância: se o Pixel falhar (bloqueadores), CAPI garante
// - Desduplicação via event_id compartilhado
// ================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { data, test_event_code } = body

    // Token e Pixel ID ficam seguros no servidor como secrets do Supabase
    const access_token = Deno.env.get('META_CAPI_TOKEN')
    const pixel_id = body.pixel_id || Deno.env.get('META_PIXEL_ID')

    if (!data || !pixel_id) {
      return new Response(
        JSON.stringify({ error: 'Parâmetro obrigatório: data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!access_token) {
      console.error('[CAPI] META_CAPI_TOKEN não configurado nas secrets do Supabase')
      return new Response(
        JSON.stringify({ error: 'Token de acesso não configurado no servidor' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Captura o IP real do cliente a partir dos headers do request
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      null

    // Enriquece cada evento com dados server-side
    const enrichedData = data.map((event: any) => ({
      ...event,
      user_data: {
        ...event.user_data,
        // Adiciona IP do cliente capturado pelo servidor
        ...(clientIp && { client_ip_address: clientIp }),
      },
    }))

    // Monta o payload para a API de Conversões da Meta
    const payload: any = { data: enrichedData }

    // Se houver test_event_code, adiciona para testes no Gerenciador de Eventos
    if (test_event_code) {
      payload.test_event_code = test_event_code
    }

    // Envia para a API de Conversões
    const metaApiUrl = `https://graph.facebook.com/v21.0/${pixel_id}/events?access_token=${access_token}`

    const metaResponse = await fetch(metaApiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const metaResult = await metaResponse.json()

    if (!metaResponse.ok) {
      console.error('[CAPI] Erro da Meta:', JSON.stringify(metaResult))
      return new Response(
        JSON.stringify({
          error: 'Erro ao enviar para Meta API',
          details: metaResult,
        }),
        {
          status: metaResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('[CAPI] Eventos enviados com sucesso:', JSON.stringify({
      events_received: metaResult.events_received,
      messages: metaResult.messages,
      event_names: enrichedData.map((e: any) => e.event_name),
    }))

    return new Response(
      JSON.stringify({
        success: true,
        events_received: metaResult.events_received,
        messages: metaResult.messages,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('[CAPI] Erro interno:', err.message)
    return new Response(
      JSON.stringify({ error: 'Erro interno no servidor', message: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
