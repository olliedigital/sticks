const stripe = require('stripe')(process.env.STRIPE_SK);

// Supabase admin client for updating user profiles
const SUPABASE_URL = 'https://adcybagoehsbsljxbtgu.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function supabaseUpdate(userId, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  return res.ok;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const { type, data } = event;

  try {
    if (type === 'checkout.session.completed') {
      const session = data.object;
      const userId = session.metadata?.userId;
      if (userId) {
        await supabaseUpdate(userId, {
          is_pro: true,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          pro_since: new Date().toISOString()
        });
      }
    }

    if (type === 'customer.subscription.updated') {
      const sub = data.object;
      const userId = sub.metadata?.userId;
      if (userId) {
        const active = ['active', 'trialing'].includes(sub.status);
        await supabaseUpdate(userId, { is_pro: active });
      }
    }

    if (type === 'customer.subscription.deleted') {
      const sub = data.object;
      const userId = sub.metadata?.userId;
      if (userId) {
        await supabaseUpdate(userId, { is_pro: false });
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    res.status(500).json({ error: err.message });
  }
};

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => data += chunk);
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
