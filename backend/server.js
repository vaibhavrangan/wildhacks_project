const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');
const cors = require('cors'); // For frontend communication

const app = express();
app.use(express.json());
app.use(cors()); // Allow React frontend to call this server

// Constants
const baseUrl = 'https://demo-api.kalshi.co';
const kalshiPublicKeyOrder = '03d00dcd-0c86-4b7a-9c39-3af323fbda49';
const kalshiPublicKeyMarkets = '164c4e3e-f653-4847-b962-bc4975b91ddc';

// Load your private key (store it securely in production)
function loadPrivateKeyFromFile(filePath) {
  const keyData = fs.readFileSync(filePath, 'utf8');
  const privateKey = crypto.createPrivateKey({
    key: keyData,
    format: 'pem',
  });
  return privateKey;
}

const privateKey = loadPrivateKeyFromFile('./baseKey.txt');

// Function to sign Kalshi requests
function signPssText(privateKey, text) {
  const message = Buffer.from(text, 'utf-8');
  try {
    const signature = crypto.sign('sha256', message, {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    });
    return signature.toString('base64');
  } catch (error) {
    throw new Error("RSA sign PSS failed: " + error.message);
  }
}

// Route to place a Kalshi order
app.post('/kalshi/order', async (req, res) => {
  const { event, riskTolerance } = req.body;

  const currentTime = new Date().getTime().toString();
  const method = 'POST';
  const path = '/trade-api/v2/portfolio/orders';

  const body = {
    action: 'buy',
    client_order_id: crypto.randomUUID(),
    count: Math.floor(riskTolerance * 3),
    side: 'yes',
    ticker: 'HOMEUSY-24-T4', // Replace with a dynamic ticker
    type: 'limit',
    yes_price: 30,
  };

  const msgString = currentTime + method + path;
  const signature = signPssText(privateKey, msgString);

  const headers = {
    'KALSHI-ACCESS-KEY': kalshiPublicKeyOrder,
    'KALSHI-ACCESS-SIGNATURE': signature,
    'KALSHI-ACCESS-TIMESTAMP': currentTime,
    'Content-Type': 'application/json',
  };

  try {
    const response = await axios.post(baseUrl + path, body, { headers });
    res.json({
      status: response.status,
      data: response.data,
      price: response.data.order?.yes_price || 0.5,
    });
  } catch (error) {
    console.error('Kalshi Error:', error.message);
    res.status(500).json({ error: error.response?.data || 'Failed to place order' });
  }
});

// Route to fetch Kalshi markets
app.get('/kalshi/markets', async (req, res) => {
  const currentTime = new Date().getTime().toString();
  const method = 'GET';
  const path = '/trade-api/v2/markets';
  const msgString = currentTime + method + path;
  const signature = signPssText(privateKey, msgString);

  const headers = {
    'KALSHI-ACCESS-KEY': kalshiPublicKeyMarkets,
    'KALSHI-ACCESS-SIGNATURE': signature,
    'KALSHI-ACCESS-TIMESTAMP': currentTime,
  };

  try {
    const response = await axios.get(`${baseUrl}${path}`, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('Kalshi Market Fetch Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start the backend server
app.listen(5000, () => {
  console.log('Backend running on http://localhost:5000');
});
