// Provider-agnostic chat for Grey Orbit's AI briefing.
//
//   AI_PROVIDER=watsonx  → IBM watsonx.ai (Granite models)
//   AI_PROVIDER=anthropic (default) → Anthropic-compatible messages API
//
// Ported from grey/apps/web/lib/ai.ts

export interface ChatRequest {
  system: string
  user: string
  maxTokens?: number
}

export function aiProvider(): 'watsonx' | 'anthropic' {
  return process.env.AI_PROVIDER === 'watsonx' ? 'watsonx' : 'anthropic'
}

export async function chatText(req: ChatRequest): Promise<string> {
  return aiProvider() === 'watsonx' ? watsonxChat(req) : anthropicChat(req)
}

// --- Anthropic-compatible ----------------------------------------------------

async function anthropicChat({ system, user, maxTokens = 2048 }: ChatRequest): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const baseURL = process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'
  const model = process.env.AI_MODEL || 'claude-sonnet-4-6'

  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const res = await fetch(`${baseURL}/v1/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    }),
  })

  if (!res.ok) throw new Error(`Anthropic API failed: ${res.status}`)
  const data = await res.json() as { content?: Array<{ type: string; text?: string }> }
  return data.content?.[0]?.type === 'text' ? data.content[0].text || '' : ''
}

// --- IBM watsonx.ai (Granite) ------------------------------------------------

interface CachedToken {
  token: string
  expiresAt: number
}
let _iamToken: CachedToken | null = null

async function watsonxToken(): Promise<string> {
  const now = Date.now()
  if (_iamToken && _iamToken.expiresAt - 60_000 > now) return _iamToken.token

  const apiKey = process.env.WATSONX_API_KEY
  if (!apiKey) throw new Error('WATSONX_API_KEY is not set')

  const res = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: apiKey,
    }),
  })
  if (!res.ok) throw new Error(`IAM token request failed: ${res.status}`)
  const data = (await res.json()) as { access_token: string; expires_in: number }
  _iamToken = { token: data.access_token, expiresAt: now + data.expires_in * 1000 }
  return _iamToken.token
}

async function watsonxChat({ system, user, maxTokens = 2048 }: ChatRequest): Promise<string> {
  const base = process.env.WATSONX_URL ?? 'https://us-south.ml.cloud.ibm.com'
  const projectId = process.env.WATSONX_PROJECT_ID
  if (!projectId) throw new Error('WATSONX_PROJECT_ID is not set')

  const token = await watsonxToken()
  const res = await fetch(`${base}/ml/v1/text/chat?version=2023-05-29`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      model_id: process.env.WATSONX_MODEL ?? 'ibm/granite-3-8b-instruct',
      project_id: projectId,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0,
    }),
  })
  if (!res.ok) throw new Error(`watsonx chat failed: ${res.status}`)
  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> }
  return data.choices?.[0]?.message?.content ?? ''
}
