const express = require('express');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.all('/api/check-flights', (req, res) => require('./api/check-flights')(req, res));
app.all('/api/cron', (req, res) => require('./api/cron')(req, res));
app.all('/api/test-email', (req, res) => require('./api/test-email')(req, res));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`✈️ Visa-Free Flight Alert Server Running locally!`);
  console.log(`🌐 Dashboard: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});
