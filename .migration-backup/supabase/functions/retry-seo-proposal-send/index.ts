import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  proposal_id: z.string().uuid(),
  kind: z.enum(['owner', 'customer']),
  recipient: z.string().trim().email().max(255).optional(),
});

const OWNER_EMAIL =
  Deno.env.get('IAM_OWNER_EMAIL') ?? 'colin@industryarmymarketing.com';
const FROM_EMAIL =
  Deno.env.get('IAM_FROM_EMAIL') ?? 'no-reply@industryarmymarketing.com';
const FROM_NAME = Deno.env.get('IAM_FROM_NAME') ?? 'Industry Army Marketing';
const REPLY_TO = Deno.env.get('IAM_REPLY_TO') ?? OWNER_EMAIL;

function esc(s: string | null | undefined): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

type Proposal = {
  id: string;
  name: string | null;
  email: string | null;
  target_url: string | null;
  keywords: string | null;
  budget: number;
  competition: string;
  target_urls: number;
  city_population: number;
  package_slug: string;
  package_price: number;
  notes: string | null;
  source: string;
};

function ownerHtml(p: Proposal, packageName: string): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;color:#181A16;max-width:640px">
    <div style="background:#181A16;color:#AEFF00;padding:20px 24px;font-weight:700;letter-spacing:2px;">
      RESEND · ${esc(packageName)} · $${p.package_price}
    </div>
    <div style="padding:20px 24px">
      <p>Retry send for proposal <code>${p.id.slice(0, 8)}</code>.</p>
      <p><strong>Contact</strong><br/>
        Name: ${esc(p.name) || '—'}<br/>
        Email: ${esc(p.email) || '—'}<br/>
        Target URL: ${esc(p.target_url) || '—'}<br/>
        Keywords: ${esc(p.keywords) || '—'}
      </p>
      <p><strong>Estimator inputs</strong><br/>
        Budget: $${p.budget}<br/>
        Competition: ${p.competition}<br/>
        Target URLs: ${p.target_urls}<br/>
        City population: ${p.city_population.toLocaleString()}
      </p>
      ${p.notes ? `<p><strong>Notes</strong><br/>${esc(p.notes)}</p>` : ''}
      <p style="color:#6E746C;font-size:12px;margin-top:24px">
        Retry does not re-attach the PDF. Regenerate the PDF from the admin
        dashboard if a fresh copy is needed.
      </p>
    </div>
  </div>`;
}

function customerHtml(p: Proposal, packageName: string): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;color:#181A16;max-width:640px">
    <div style="background:#181A16;color:#AEFF00;padding:24px;font-family:'Bebas Neue',Arial,sans-serif;font-size:28px;letter-spacing:2px;">
      ${esc(packageName)}. $${p.package_price}
    </div>
    <div style="padding:24px">
      <p>Hey ${esc(p.name) || 'there'} —</p>
      <p>Quick follow-up on the <strong>${esc(packageName)}</strong> package with Industry Army Marketing. Colin will reply directly with the proposal PDF and next steps.</p>
      <p style="color:#6E746C;font-size:12px;margin-top:24px">
        Questions? Just reply — this inbox is monitored by Colin directly.
      </p>
      <p style="color:#6E746C;font-size:12px">Industry Army Marketing · industryarmymarketing.com</p>
    </div>
  </div>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const jwt = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
  if (!jwt) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  const { data: userData, error: userErr } = await supabase.auth.getUser(jwt);
  if (userErr || !userData?.user) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const { data: isAdmin } = await supabase.rpc('has_role', {
    _user_id: userData.user.id,
    _role: 'admin',
  });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'forbidden' }), {
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: 'validation', details: parsed.error.flatten() }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
  const { proposal_id, kind, recipient: overrideRecipient } = parsed.data;

  const { data: proposal, error: propErr } = await supabase
    .from('seo_proposals')
    .select(
      'id,name,email,target_url,keywords,budget,competition,target_urls,city_population,package_slug,package_price,notes,source',
    )
    .eq('id', proposal_id)
    .maybeSingle();
  if (propErr || !proposal) {
    return new Response(JSON.stringify({ error: 'proposal_not_found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const p = proposal as Proposal;

  const packageName =
    p.package_slug === 'bullets'
      ? 'Bullets'
      : p.package_slug === 'boom'
        ? 'Boom'
        : 'Bombs';

  const recipient =
    overrideRecipient ??
    (kind === 'owner' ? OWNER_EMAIL : p.email ?? '');

  let status: 'sent' | 'failed' | 'skipped' = 'skipped';
  let messageId: string | null = null;
  let errorMessage: string | null = null;

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!recipient) {
    status = 'skipped';
    errorMessage = 'no_recipient';
  } else if (!apiKey) {
    status = 'failed';
    errorMessage = 'RESEND_API_KEY not configured';
  } else {
    const html = kind === 'owner' ? ownerHtml(p, packageName) : customerHtml(p, packageName);
    const subject =
      kind === 'owner'
        ? `[IAM Retry] ${packageName} · $${p.package_price} — ${p.name ?? 'anon'}`
        : `Your ${packageName} SEO proposal — Industry Army Marketing`;
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${FROM_NAME} <${FROM_EMAIL}>`,
          to: [recipient],
          reply_to: kind === 'owner' ? (p.email ?? REPLY_TO) : REPLY_TO,
          subject,
          html,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        status = 'failed';
        errorMessage = `resend_${res.status}: ${text.slice(0, 500)}`;
      } else {
        try {
          const json = (await res.json()) as { id?: string };
          messageId = json?.id ?? null;
        } catch {
          // ignore
        }
        status = 'sent';
      }
    } catch (err) {
      status = 'failed';
      errorMessage = err instanceof Error ? err.message : String(err);
    }
  }

  // Log the attempt.
  const { error: attemptErr } = await supabase
    .from('proposal_email_attempts')
    .insert({
      proposal_id,
      kind,
      recipient: recipient || '(no recipient)',
      status,
      message_id: messageId,
      error: errorMessage,
    });
  if (attemptErr) {
    console.error('attempt log failed:', attemptErr.message);
  }

  // Update the proposal's stored latest-status columns for the retried kind.
  const nowIso = new Date().toISOString();
  const updateData: Record<string, unknown> = { email_attempted_at: nowIso };
  if (kind === 'owner') {
    updateData.owner_email_status = status;
    updateData.owner_email_error = errorMessage;
    updateData.owner_message_id = messageId;
    updateData.emailed_owner = status === 'sent';
  } else {
    updateData.customer_email_status = status;
    updateData.customer_email_error = errorMessage;
    updateData.customer_message_id = messageId;
    updateData.emailed_customer = status === 'sent';
  }
  const { error: updErr } = await supabase
    .from('seo_proposals')
    .update(updateData)
    .eq('id', proposal_id);
  if (updErr) {
    console.error('proposal update failed:', updErr.message);
  }

  return new Response(
    JSON.stringify({ status, messageId, error: errorMessage, recipient }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
});