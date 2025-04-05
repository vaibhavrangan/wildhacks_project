import React, { useState } from 'react';
import axios from 'axios';
import EventInput from './components/EventInput';
import TradeResults from './components/TradeResults';
import { Container, Typography } from '@mui/material';
import './App.css';

function App() {
  const [tradeData, setTradeData] = useState(null);

  const processWithGemini = async (input) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const eventMatch = input.match(/candidate (\w+) winning/i);
        const candidate = eventMatch ? eventMatch[1] : 'Unknown';
        resolve({ event: `${candidate} winning election` });
      }, 500);
    });
  };

  const fetchPredictionMarketData = async (event, riskTolerance) => {
    try {
      // Call backend for Kalshi data
      const kalshiResponse = await axios.post('http://localhost:5000/kalshi/order', {
        event,
        riskTolerance,
      });
      const kalshiPrice = kalshiResponse.data.price || 0.5;

      // Placeholder for Polymarket (add real API later)
      const polymarketPrice = 0.65;

      return {
        polymarket: { price: polymarketPrice, volume: 1000000 },
        kalshi: { price: kalshiPrice, volume: 800000 },
      };
    } catch (error) {
      console.error('Error fetching market data:', error);
      return { polymarket: { price: 0.5 }, kalshi: { price: 0.5 } };
    }
  };

  const fetchStockData = async (event) => {
    // Placeholder - add real stock API later
    return [
      { symbol: 'CNN', price: 50, correlation: 0.8 },
      { symbol: 'TWTR', price: 45, correlation: 0.7 },
    ];
  };

  const calculateOptimalTrades = (marketData, stockData, riskTolerance) => {
    const riskFactor = riskTolerance / 10;
    const totalCapital = 1000;
    const trades = [];

    const avgPrice = (marketData.polymarket.price + marketData.kalshi.price) / 2;
    const marketInvestment = totalCapital * riskFactor * 0.6;
    trades.push({
      type: 'Prediction Market',
      platform: 'Polymarket & Kalshi',
      price: avgPrice,
      amount: marketInvestment,
      potentialReturn: marketInvestment / avgPrice,
    });

    stockData.forEach((stock) => {
      const stockInvestment = totalCapital * riskFactor * 0.2 * stock.correlation;
      trades.push({
        type: 'Stock',
        symbol: stock.symbol,
        price: stock.price,
        amount: stockInvestment,
        potentialReturn: stockInvestment / stock.price * 1.05,
      });
    });

    return trades;
  };

  const handleSubmit = async (eventInput, riskTolerance) => {
    try {
      const parsedEvent = await processWithGemini(eventInput);
      const marketData = await fetchPredictionMarketData(parsedEvent.event, riskTolerance);
      const stockData = await fetchStockData(parsedEvent.event);
      const trades = calculateOptimalTrades(marketData, stockData, riskTolerance);
      setTradeData(trades);
    } catch (error) {
      console.error('Error:', error);
      setTradeData({ error: 'Failed to process request' });
    }
  };

  return (
    <Container maxWidth="md" className="App">
      <Typography variant="h4" gutterBottom>
        Wildhacks_Project
      </Typography>
      <EventInput onSubmit={handleSubmit} />
      {tradeData && <TradeResults trades={tradeData} />}
    </Container>
  );
}

export default App;