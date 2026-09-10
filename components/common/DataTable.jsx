"use client";

import React, { useState, useMemo } from 'react';
import { Search, Filter, ArrowUpDown, Plus, RefreshCw, Inbox } from 'lucide-react';

export default function DataTable({
  title,
  subtitle,
  data = [],
  columns = [],
  searchKeys = ['name'],
  searchPlaceholder = '검색어를 입력하세요...',
  filterOptions = [], // [{ label: '전체', value: 'all' }, ...]
  filterKey = null,
  sortOptions = [], // [{ label: '이름순', key: 'name', dir: 'asc' }, ...]
  onAdd = null,
  addButtonText = '신규 등록',
  onRefresh = null,
  isRefreshing = false,
  extraHeaderActions = null,
  keyField = 'id',
  onRowClick = null
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]?.value || 'all');
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]?.key || (columns[0]?.key || ''));
  const [sortDir, setSortDir] = useState(sortOptions[0]?.dir || 'asc');

  // Filtering & Searching & Sorting logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // 1. Filter
    if (filterKey && selectedFilter && selectedFilter !== 'all') {
      result = result.filter(item => {
        const val = item[filterKey];
        return String(val) === String(selectedFilter);
      });
    }

    // 2. Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        return searchKeys.some(key => {
          const val = item[key];
          if (val === undefined || val === null) return false;
          if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(q);
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // 3. Sort
    if (selectedSort && selectedSort !== '_order' && selectedSort !== 'default') {
      result.sort((a, b) => {
        let valA = a[selectedSort];
        let valB = b[selectedSort];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDir === 'asc' ? valA - valB : valB - valA;
        }

        const comp = String(valA).localeCompare(String(valB), 'ko-KR', { numeric: true });
        return sortDir === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [data, filterKey, selectedFilter, searchQuery, searchKeys, selectedSort, sortDir]);

  const handleSortToggle = (key) => {
    if (selectedSort === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSelectedSort(key);
      setSortDir('asc');
    }
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '16px',
      border: '1px solid #EAE8E3',
      boxShadow: '0 4px 20px rgba(180, 160, 120, 0.06)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* 1. Header Toolbar */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid #EAE8E3',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Title & Count */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#2B2A27', margin: 0 }}>
              {title}
            </h2>
            <span style={{
              backgroundColor: '#FFEFA6',
              color: '#8C6F3E',
              padding: '2px 8px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '800'
            }}>
              총 {filteredData.length}건
            </span>
          </div>
          {subtitle && (
            <p style={{ fontSize: '13px', color: '#6B6862', margin: '4px 0 0 0' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                border: '1px solid #EAE8E3',
                backgroundColor: '#FAF6EE',
                color: '#6B6862',
                cursor: isRefreshing ? 'wait' : 'pointer',
                transition: 'all 0.2s ease'
              }}
              title="데이터 새로고침"
            >
              <RefreshCw size={16} className={isRefreshing ? 'spin-animation' : ''} />
            </button>
          )}

          {/* Extra Actions */}
          {extraHeaderActions}

          {/* Add Button */}
          {onAdd && (
            <button
              onClick={onAdd}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#2D6A4F',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(45, 106, 79, 0.25)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1B4332'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2D6A4F'}
            >
              <Plus size={16} />
              <span>{addButtonText}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div style={{
        padding: '14px 24px',
        backgroundColor: '#FAF9F6',
        borderBottom: '1px solid #EAE8E3',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        justifyContent: 'space-between'
      }}>
        {/* Search Input */}
        <div style={{
          position: 'relative',
          flexGrow: 1,
          maxWidth: '400px',
          minWidth: '240px'
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#8C6F3E',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchPlaceholder}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              fontSize: '13px',
              borderRadius: '8px',
              border: '1px solid #EAE8E3',
              backgroundColor: '#FFFFFF',
              color: '#2B2A27',
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#FFAA00'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#EAE8E3'}
          />
        </div>

        {/* Filters and Sorters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Category Filter */}
          {filterOptions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: '#6B6862' }} />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '1px solid #EAE8E3',
                  backgroundColor: '#FFFFFF',
                  color: '#2B2A27',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {filterOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Selector */}
          {sortOptions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ArrowUpDown size={14} style={{ color: '#6B6862' }} />
              <select
                value={`${selectedSort}_${sortDir}`}
                onChange={(e) => {
                  const [key, dir] = e.target.value.split('_');
                  setSelectedSort(key);
                  setSortDir(dir);
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '1px solid #EAE8E3',
                  backgroundColor: '#FFFFFF',
                  color: '#2B2A27',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {sortOptions.map(opt => (
                  <option key={`${opt.key}_${opt.dir}`} value={`${opt.key}_${opt.dir}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 3. Table Element */}
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{
              backgroundColor: '#FAF6EE',
              borderBottom: '1px solid #EAE8E3',
              color: '#6B6862',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable && handleSortToggle(col.key)}
                  style={{
                    padding: '14px 18px',
                    width: col.width || 'auto',
                    textAlign: col.align || 'left',
                    cursor: col.sortable ? 'pointer' : 'default',
                    userSelect: 'none',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start'
                  }}>
                    <span>{col.label}</span>
                    {col.sortable && selectedSort === col.key && (
                      <span style={{ fontSize: '10px', color: '#FFAA00' }}>
                        {sortDir === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#A09E9B' }}>
                    <Inbox size={42} style={{ strokeWidth: 1.5 }} />
                    <p style={{ fontSize: '15px', fontWeight: '600', color: '#6B6862', margin: 0 }}>
                      등록된 데이터가 없거나 검색 결과가 없습니다.
                    </p>
                    <p style={{ fontSize: '13px', margin: 0 }}>
                      상단 신규 등록 버튼을 눌러 새 항목을 추가해 보세요.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((row, idx) => (
                <tr
                  key={row[keyField] || idx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{
                    borderBottom: '1px solid #F0EEE9',
                    backgroundColor: idx % 2 === 1 ? '#FAFAF8' : '#FFFFFF',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFDF5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = idx % 2 === 1 ? '#FAFAF8' : '#FFFFFF';
                  }}
                >
                  {columns.map(col => (
                    <td
                      key={col.key}
                      style={{
                        padding: '14px 18px',
                        textAlign: col.align || 'left',
                        verticalAlign: 'middle',
                        color: '#2B2A27'
                      }}
                    >
                      {col.render ? col.render(row[col.key], row, idx) : (row[col.key] !== undefined ? String(row[col.key]) : '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
