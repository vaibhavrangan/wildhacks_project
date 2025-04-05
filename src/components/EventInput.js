import React, { useState } from 'react';

function EventInput({ onSubmit }) {
  const [eventInput, setEventInput] = useState('');
  const [riskTolerance, setRiskTolerance] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(eventInput, riskTolerance);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>
          Event (e.g., "Candidate Jane winning election"):
          <input
            type="text"
            value={eventInput}
            onChange={(e) => setEventInput(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Risk Tolerance (1-10):
          <input
            type="number"
            min="1"
            max="10"
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(Number(e.target.value))}
            required
          />
        </label>
      </div>
      <button type="submit">Calculate Trades</button>
    </form>
  );
}

export default EventInput;