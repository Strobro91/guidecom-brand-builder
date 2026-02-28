const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the project root
app.use(express.static(path.join(__dirname)));

// Route the root URL to the brand builder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'guidecom-brand-builder.html'));
});

app.get('/game-plan', (req, res) => {
  res.sendFile(path.join(__dirname, 'defensive-game-plan.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Guidecom Brand Builder running on port ${PORT}`);
});
