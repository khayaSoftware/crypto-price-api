const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/price', async (req, res) => {
    const { coin = 'bitcoin', currency = 'usd' } = req.query;

    try {
        // Fetch price data with 24h change included
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${currency}&include_24hr_change=true`;
        const response = await axios.get(url);

        if (response.data && response.data[coin]) {
            const data = response.data[coin];

            // Determine market sentiment based on 24h percentage change
            const changeKey = `${currency}_24h_change`;
            const change = data[changeKey];
            let sentiment = 'neutral';
            if (change > 0) sentiment = 'bullish';
            else if (change < 0) sentiment = 'bearish';

            // Add sentiment to the response
            data.sentiment = sentiment;

            res.json(data);
        } else {
            res.status(404).json({ error: 'Coin not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch price data' });
    }
});

app.listen(PORT, () => console.log(`Crypto Price API running on port ${PORT}`));
