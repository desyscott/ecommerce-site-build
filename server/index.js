require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://azubi-tmp.netlify.app'],
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,
  })
);

const storeItems = new Map([
  ['XX99 MK II', { priceInCents: 299900, name: 'XX99 Mark II Headphones' }],
  ['XX99 MK I', { priceInCents: 175000, name: 'XX99 Mark I Headphones' }],
  ['XX59', { priceInCents: 89900, name: 'XX59 Headphones' }],
  ['ZX9', { priceInCents: 450000, name: 'ZX9 Speaker' }],
  ['ZX7', { priceInCents: 350000, name: 'ZX7 Speaker' }],
  ['YX1', { priceInCents: 59900, name: 'YX1 Speaker' }],
]);

const calculateTotal = (items) => {
  return items.reduce((total, item) => {
    const storeItem = storeItems.get(item.id);
    if (!storeItem) return total;
    return total + storeItem.priceInCents * item.quantity;
  }, 0);
};

// Unified endpoint for all payment methods
app.post('/create-order', async (req, res) => {
  const { items, userName, paymentMethod, eMoneyNumber, eMoneyPin } = req.body;

  if (!items || !userName || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['cash', 'e-money'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method' });
  }

  // Validate e-money details if payment method is e-money
  if (paymentMethod === 'e-money') {
    if (!eMoneyNumber || !eMoneyPin) {
      return res.status(400).json({ error: 'e-Money number and PIN are required' });
    }
    if (!/^\d{9}$/.test(eMoneyNumber)) {
      return res.status(400).json({ error: 'e-Money number must be 9 digits' });
    }
    if (!/^\d{4}$/.test(eMoneyPin)) {
      return res.status(400).json({ error: 'e-Money PIN must be 4 digits' });
    }
  }

  try {
    const orderSummary = items.map(item => {
      const storeItem = storeItems.get(item.id);
      if (!storeItem) throw new Error(`Invalid item: ${item.id}`);
      return {
        name: storeItem.name,
        quantity: item.quantity,
        price: storeItem.priceInCents,
      };
    });

    const total = calculateTotal(items);
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

    console.log(`🧾 New order #${orderNumber} from ${userName}`);
    console.log(`💳 Payment method: ${paymentMethod}`);
    if (paymentMethod === 'e-money') {
      console.log(`🔢 e-Money number: ${eMoneyNumber}`);
      // In a real app, you would process the e-money payment here
      console.log('✅ Simulated e-Money payment processed');
    }

    const successUrl = `${process.env.SERVER_URL || 'http://localhost:5173'}/checkout?ordersuccess=true&orderNumber=${orderNumber}`;

    res.json({
      url: successUrl,
      orderNumber,
      summary: orderSummary,
      total,
      userName,
      paymentMethod,
      status: paymentMethod === 'cash' ? 'pending_payment' : 'paid'
    });
  } catch (error) {
    console.error('❌ Order processing error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(3000, () => {
  console.log('✅ Checkout server running on http://localhost:3000');
});