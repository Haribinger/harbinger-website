/**
 * Stripe webhook handler — generates license key on successful payment.
 *
 * Add to your Express server routes.
 * Stripe sends checkout.session.completed -> we generate a key.
 */
import crypto from 'crypto';

const LICENSE_SECRET = process.env.HARBINGER_LICENSE_SECRET || 'harbinger-v2-default-secret';

interface LicenseKey {
  key: string;
  tier: string;
  email: string;
}

export function generateLicenseKey(email: string, tier: string = 'PRO'): LicenseKey {
  const ts = Math.floor(Date.now() / 1000);
  const tsHex = ts.toString(16);

  const payload = `${tier}:${tsHex}:${email}`;
  const sig = crypto
    .createHmac('sha256', LICENSE_SECRET)
    .update(payload)
    .digest('hex')
    .slice(0, 16);

  return {
    key: `HBG-${tier}-${tsHex}-${sig}`,
    tier,
    email,
  };
}

/**
 * Express route handler for Stripe webhooks.
 *
 * Usage:
 *   app.post('/api/stripe/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);
 */
export async function handleStripeWebhook(req: any, res: any) {
  const stripe = await import('stripe');
  const stripeClient = new stripe.default(process.env.STRIPE_SECRET_KEY || '', {
    apiVersion: '2024-12-18.acacia' as any,
  });

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const email = session.customer_email || session.customer_details?.email || '';

    // Determine tier from metadata or price
    const tier = session.metadata?.tier || 'PRO';

    // Generate license key
    const license = generateLicenseKey(email, tier);

    console.log(`License generated for ${email}: ${license.key} (${tier})`);

    // TODO: Send email with license key (use Resend, SendGrid, etc.)
    // For now, store it and show on success page

    // Store in memory (replace with DB in production)
    (globalThis as any).__licenses = (globalThis as any).__licenses || {};
    (globalThis as any).__licenses[session.id] = license;
  }

  res.json({ received: true });
}

/**
 * Success page endpoint — show license key after payment.
 */
export function handleCheckoutSuccess(req: any, res: any) {
  const sessionId = req.query.session_id;
  const licenses = (globalThis as any).__licenses || {};
  const license = licenses[sessionId];

  if (license) {
    res.json({
      success: true,
      license_key: license.key,
      tier: license.tier,
      instructions: [
        `1. Install Harbinger: git clone https://github.com/Haribinger/Harbinger`,
        `2. Activate: harbinger license --key ${license.key}`,
        `3. Start: docker compose up --build`,
      ],
    });
  } else {
    res.json({ success: false, message: 'License key not found. Check your email.' });
  }
}
