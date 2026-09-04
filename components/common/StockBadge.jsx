"use client";

import React from 'react';
import { getStockStatus } from '../../lib/inventoryCommon';

export default function StockBadge({ stock, unit = '', minThreshold = 10, dangerThreshold = 0 }) {
  const info = getStockStatus(stock, minThreshold, dangerThreshold);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '3px 8px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      backgroundColor: info.bg,
      color: info.color,
      border: `1px solid ${info.color}33`,
      whiteSpace: 'nowrap'
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        backgroundColor: info.color
      }} />
      <span>{Number(stock).toLocaleString()} {unit}</span>
      <span style={{ opacity: 0.8, fontSize: '11px' }}>({info.label})</span>
    </span>
  );
}
