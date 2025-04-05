import React from 'react';

function TradeResults({ trades }) {
  if (trades.error) {
    return <div>Error: {trades.error}</div>;
  }

  return (
    <div>
      <h2>Optimal Trades</h2>
      <ul>
        {trades.map((trade, index) => (
          <li key={index}>
            <strong>{trade.type}</strong>: 
            {trade.platform ? ` ${trade.platform}` : ` ${trade.symbol}`} - 
            Price: ${trade.price.toFixed(2)}, 
            Investment: ${trade.amount.toFixed(2)}, 
            Potential Return: ${trade.potentialReturn.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TradeResults;