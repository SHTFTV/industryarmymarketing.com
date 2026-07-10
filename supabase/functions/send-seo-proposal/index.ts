import { createClient } from 'npm:@supabase/supabase-js@2.45.0';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  name: z.string().trim().max(100).nullable().optional(),
  email: z
    .union([z.string().trim().email().max(255), z.literal(''), z.null()])
    .optional(),
  target_url: z.string().trim().max(500).nullable().optional(),
  keywords: z.string().trim().max(500).nullable().optional(),
  budget: z.number().int().min(0).max(50_000),
  competition: z.enum(['low', 'medium', 'high']),
  target_urls: z.number().int().min(1).max(50),
  city_population: z.number().int().min(0).max(50_000_000),
  package_slug: z.enum(['bullets', 'boom', 'bombs']),
  package_price: z.number().int().min(0).max(10_000),
  package_name: z.string().max(40),
  source: z.string().max(40).default('estimator'),
  notes: z.string().max(4000).nullable().optional(),
  referrer: z.string().max(500).nullable().optional(),
  user_agent: z.string().max(500).nullable().optional(),
  pdf_base64: z.string().max(6_000_000),
  pdf_filename: z.string().max(120),
});

const OWNER_EMAIL =
  Deno.env.get('IAM_OWNER_EMAIL') ?? 'colin@industryarmymarketing.com';
const FROM_EMAIL =
  Deno.env.get('IAM_FROM_EMAIL') ?? 'no-reply@industryarmymarketing.com';
const FROM_NAME = Deno.env.get('IAM_FROM_NAME') ?? 'Industry Army Marketing';
const REPLY_TO = Deno.env.get('IAM_REPLY_TO') ?? OWNER_EMAIL;

type SendResult = {
  ok: boolean;
  status: 'sent' | 'failed' | 'skipped';
  messageId?: string;
  error?: string;
};

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  pdfBase64: string;
  pdfFilename: string;
  replyTo?: string;
}): Promise<SendResult> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    return {
      ok: false,
      status: 'failed',
      error: 'RESEND_API_KEY not configured',
    };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${FROM_NAME} <${FROM_EMAIL}>`,
        to: [params.to],
        reply_to: params.replyTo ?? REPLY_TO,
        subject: params.subject,
        html: params.html,
        attachments: [
          {
            filename: params.pdfFilename,
            content: params.pdfBase64,
          },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error(`Resend send failed [${res.status}]: ${text}`);
      return {
        ok: false,
        status: 'failed',
        error: `resend_${res.status}: ${text.slice(0, 500)}`,
      };
    }
    let messageId: string | undefined;
    try {
      const json = (await res.json()) as { id?: string };
      messageId = json?.id;
    } catch {
      // ignore parse error
    }
    return { ok: true, status: 'sent', messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Resend send threw:', message);
    return { ok: false, status: 'failed', error: message };
  }
}

function esc(s: string | null | undefined): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function ownerEmailHtml(p: z.infer<typeof BodySchema>): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;color:#181A16;max-width:640px">
    <div style="background:#181A16;color:#AEFF00;padding:20px 24px;font-weight:700;letter-spacing:2px;">
      NEW SEO PROPOSAL · ${esc(p.package_name)} · $${p.package_price}
    </div>
    <div style="padding:20px 24px">
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
      <p><strong>Source:</strong> ${esc(p.source)}</p>
      ${p.notes ? `<p><strong>Notes</strong><br/>${esc(p.notes)}</p>` : ''}
      <p style="color:#6E746C;font-size:12px;margin-top:24px">
        Proposal PDF attached. Reply to the customer's email directly to lock in the order.
      </p>
    </div>
  </div>`;
}

function customerEmailHtml(p: z.infer<typeof BodySchema>): string {
  return `
  <div style="font-family:Inter,Arial,sans-serif;color:#181A16;max-width:640px">
    <div style="background:#181A16;color:#AEFF00;padding:24px;font-family:'Bebas Neue',Arial,sans-serif;font-size:28px;letter-spacing:2px;">
      ${esc(p.package_name)}. $${p.package_price}
    </div>
    <div style="padding:24px">
      <p>Hey ${esc(p.name) || 'there'} —</p>
      <p>Thanks for locking in the <strong>${esc(p.package_name)}</strong> package with Industry Army Marketing. Your full proposal PDF is attached to this email.</p>
      <p><strong>What happens next</strong></p>
      <ol>
        <li>Colin reviews your target URL and keyword mix (within 24h).</li>
        <li>You get a confirmation email with your invoice and start date.</li>
        <li>Delivery kicks off on Day 1 — you'll get progress updates and a full link report at the end.</li>
      </ol>
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
  const p = parsed.data;
  const customerEmail = p.email && p.email !== '' ? p.email : null;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );

  // 1. Send emails (best-effort).
  const ownerResult = await sendEmail({
    to: OWNER_EMAIL,
    subject: `[IAM Order] ${p.package_name} · $${p.package_price} — ${p.name ?? 'anon'}`,
    html: ownerEmailHtml(p),
    pdfBase64: p.pdf_base64,
    pdfFilename: p.pdf_filename,
    replyTo: customerEmail ?? undefined,
  });

  let customerResult: SendResult = {
    ok: false,
    status: 'skipped',
    error: 'no_customer_email',
  };
  if (customerEmail) {
    customerResult = await sendEmail({
      to: customerEmail,
      subject: `Your ${p.package_name} SEO proposal — Industry Army Marketing`,
      html: customerEmailHtml(p),
      pdfBase64: p.pdf_base64,
      pdfFilename: p.pdf_filename,
    });
  }

  // 2. Persist the lead (never blocks on email failure).
  const { data: inserted, error: insertError } = await supabase
    .from('seo_proposals')
    .insert({
      name: p.name ?? null,
      email: customerEmail,
      target_url: p.target_url ?? null,
      keywords: p.keywords ?? null,
      budget: p.budget,
      competition: p.competition,
      target_urls: p.target_urls,
      city_population: p.city_population,
      package_slug: p.package_slug,
      package_price: p.package_price,
      source: p.source,
      notes: p.notes ?? null,
      referrer: p.referrer ?? null,
      user_agent: p.user_agent ?? null,
      emailed_owner: ownerResult.ok,
      emailed_customer: customerResult.ok,
      owner_email_status: ownerResult.status,
      customer_email_status: customerResult.status,
      owner_email_error: ownerResult.error ?? null,
      customer_email_error: customerResult.error ?? null,
      owner_message_id: ownerResult.messageId ?? null,
      customer_message_id: customerResult.messageId ?? null,
      email_attempted_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('seo_proposals insert failed:', insertError.message);
  }

  // Log each send attempt into the audit table (best-effort).
  if (inserted?.id) {
    const attempts: Array<{
      proposal_id: string;
      kind: 'owner' | 'customer' | 'test';
      recipient: string;
      status: SendResult['status'];
      message_id: string | null;
      error: string | null;
    }> = [
      {
        proposal_id: inserted.id,
        kind: 'owner',
        recipient: OWNER_EMAIL,
        status: ownerResult.status,
        message_id: ownerResult.messageId ?? null,
        error: ownerResult.error ?? null,
      },
      {
        proposal_id: inserted.id,
        kind: 'customer',
        recipient: customerEmail ?? '(no email provided)',
        status: customerResult.status,
        message_id: customerResult.messageId ?? null,
        error: customerResult.error ?? null,
      },
    ];
    const { error: attemptError } = await supabase
      .from('proposal_email_attempts')
      .insert(attempts);
    if (attemptError) {
      console.error(
        'proposal_email_attempts insert failed:',
        attemptError.message,
      );
    }
  }

  const warning =
    !ownerResult.ok || (customerEmail && !customerResult.ok)
      ? ownerResult.error === 'RESEND_API_KEY not configured'
        ? 'Email delivery is not configured yet, but your request has been saved.'
        : 'Some emails could not be delivered, but your request has been saved.'
      : undefined;

  return new Response(
    JSON.stringify({
      proposalId: inserted?.id ?? null,
      emailedOwner: ownerResult.ok,
      emailedCustomer: customerResult.ok,
      warning,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
});