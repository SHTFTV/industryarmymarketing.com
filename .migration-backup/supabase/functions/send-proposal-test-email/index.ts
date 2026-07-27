import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  proposal_id: z.string().uuid(),
  recipient: z.string().trim().email().max(255),
});

const FROM_EMAIL =
  Deno.env.get('IAM_FROM_EMAIL') ?? 'no-reply@industryarmymarketing.com';
const FROM_NAME = Deno.env.get('IAM_FROM_NAME') ?? 'Industry Army Marketing';
const REPLY_TO =
  Deno.env.get('IAM_REPLY_TO') ?? 'colin@industryarmymarketing.com';

function esc(s: string | null | undefined): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

  // Require an authenticated admin caller.
  const authHeader = req.headers.get('Authorization') ?? '';
  const jwt = authHeader.replace(/^Bearer\s+/i, '');
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
  const { data: isAdmin, error: roleErr } = await supabase.rpc('has_role', {
    _user_id: userData.user.id,
    _role: 'admin',
  });
  if (roleErr || !isAdmin) {
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
  const { proposal_id, recipient } = parsed.data;

  const { data: proposal, error: propErr } = await supabase
    .from('seo_proposals')
    .select(
      'id,name,email,target_url,keywords,budget,competition,target_urls,city_population,package_slug,package_price',
    )
    .eq('id', proposal_id)
    .maybeSingle();
  if (propErr || !proposal) {
    return new Response(JSON.stringify({ error: 'proposal_not_found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const apiKey = Deno.env.get('RESEND_API_KEY');
  let status: 'sent' | 'failed' | 'skipped' = 'skipped';
  let messageId: string | null = null;
  let errorMessage: string | null = null;

  if (!apiKey) {
    status = 'failed';
    errorMessage = 'RESEND_API_KEY not configured';
  } else {
    const html = `
      <div style="font-family:Inter,Arial,sans-serif;color:#181A16;max-width:640px">
        <div style="background:#181A16;color:#AEFF00;padding:20px 24px;font-weight:700;letter-spacing:2px;">
          TEST EMAIL · Proposal ${proposal.id.slice(0, 8)}
        </div>
        <div style="padding:20px 24px">
          <p>This is a test send triggered from the admin dashboard.</p>
          <p>
            Name: ${esc(proposal.name) || '—'}<br/>
            Email: ${esc(proposal.email) || '—'}<br/>
            Package: ${esc(proposal.package_slug)} · $${proposal.package_price}<br/>
            Target URL: ${esc(proposal.target_url) || '—'}<br/>
            Keywords: ${esc(proposal.keywords) || '—'}
          </p>
          <p style="color:#6E746C;font-size:12px;margin-top:24px">
            Sent at ${new Date().toISOString()} · no attachment
          </p>
        </div>
      </div>`;
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
          reply_to: REPLY_TO,
          subject: `[IAM Test] Proposal ${proposal.id.slice(0, 8)} — ${proposal.package_slug}`,
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

  const { error: logErr } = await supabase
    .from('proposal_email_attempts')
    .insert({
      proposal_id,
      kind: 'test',
      recipient,
      status,
      message_id: messageId,
      error: errorMessage,
    });
  if (logErr) {
    console.error('test attempt log insert failed:', logErr.message);
  }

  return new Response(
    JSON.stringify({
      status,
      messageId,
      error: errorMessage,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
});