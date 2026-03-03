const stripe = require('stripe')(process.env.STRIPE_SK);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  try {
    const { priceId, userId, email, returnUrl } = req.body;
    if (!priceId || !userId) return res.status(400).json({ error: 'Missing priceId or userId' });

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email || undefined,
      metadata: { userId },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: (returnUrl || 'https://sticks-golf.vercel.app') + '?upgraded=true',
      cancel_url: (returnUrl || 'https://sticks-golf.vercel.app') + '?cancelled=true',
      subscription_data: { metadata: { userId } },
      allow_promotion_codes: true,
    });

    res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: err.message });
  }
};
