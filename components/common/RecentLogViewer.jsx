"use client";

import React from 'react';
import { Clock } from 'lucide-react';
import { formatDateTime } from '../../lib/inventoryCommon';

export default function RecentLogViewer({ logs = [], itemName = '', category = '' }) {
  // Find most recent log that includes this itemName or category
  const relevantLog = logs.find(log => {
    if (!log.changes || !Array.isArray(log.changes)) return false;
    return log.changes.some(c => {
      const matchName = itemName ? c.name?.includes(itemName) || itemName?.includes(c.name) : true;
      const matchCat = category ? c.category === category : true;
      return matchName && matchCat;
    });
  });

  if (!relevantLog) {
    return (
      <span style={{ fontSize: '11px', color: '#A09E9B', fontStyle: 'italic' }}>
        최근 변동 이력 없음
      </span>
    );
  }

  const changeItem = relevantLog.changes.find(c => {
    return itemName ? (c.name?.includes(itemName) || itemName?.includes(c.name)) : true;
  }) || relevantLog.changes[0];

  const isPositive = (changeItem?.diff || 0) > 0;
  const diffText = changeItem ? `${isPositive ? '+' : ''}${changeItem.diff}${changeItem.unit || ''}` : '';

  return (
    <div 
      title={`사유: ${relevantLog.reason}\n일시: ${formatDateTime(relevantLog.created_at)}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        backgroundColor: '#F3F2EE',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#55524E',
        maxWidth: '100%',
        cursor: 'help'
      }}
    >
      <Clock size={11} style={{ flexShrink: 0, color: '#8C6F3E' }} />
      <span style={{ fontWeight: '700', color: isPositive ? '#2D6A4F' : '#C0392B' }}>
        {diffText}
      </span>
      <span style={{ color: '#8C8984', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
        ({relevantLog.reason || '변경'})
      </span>
    </div>
  );
}
