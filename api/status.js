const stripe = require('stripe')(process.env.STRIPE_SK);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { customerId } = req.body;
    if (!customerId) return res.status(400).json({ error: 'Missing customerId' });

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1
    });

    const active = subs.data.length > 0;
    const sub = active ? subs.data[0] : null;

    res.status(200).json({
      isPro: active,
      plan: sub ? (sub.items.data[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly') : null,
      currentPeriodEnd: sub ? sub.current_period_end : null,
      cancelAtPeriodEnd: sub ? sub.cancel_at_period_end : false
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
