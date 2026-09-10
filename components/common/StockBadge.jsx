"use client";

import React from 'react';

export default function StockBadge({ stock, unit = '' }) {
  const formatted = Number(stock || 0).toLocaleString();

  return (
    <span style={{
      display: 'inline-block',
      fontSize: '15px',
      fontWeight: '800',
      color: '#2B2A27',
      letterSpacing: '-0.3px',
      whiteSpace: 'nowrap'
    }}>
      {formatted} {unit}
    </span>
  );
}

