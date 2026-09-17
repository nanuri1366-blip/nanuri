"use client";

import React, { useState, useMemo } from 'react';
import { Search, Filter, RefreshCw, Inbox, GripVertical, Info } from 'lucide-react';

export default function DataTable({
  title,
  subtitle,
  data = [],
  columns = [],
  searchKeys = ['name'],
  searchPlaceholder = '검색어를 입력하세요...',
  filterOptions = [], // [{ label: '전체', value: 'all' }, ...]
  filterKey = null,
  onAdd = null,
  addButtonText = '신규 등록',
  onRefresh = null,
  isRefreshing = false,
  extraHeaderActions = null,
  keyField = 'id',
  onRowClick = null,
  onReorderRows = null // (reorderedList) => void for drag & drop
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState(filterOptions[0]?.value || 'all');
  const [selectedSort, setSelectedSort] = useState(''); // '' means default / 설정순
  const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc'
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // 1. Is in Default / 설정순 state?
  const isDefaultOrder = !selectedSort && !searchQuery.trim() && (!filterKey || selectedFilter === 'all');

  // 2. Filtering & Searching & Sorting pipeline
  const filteredData = useMemo(() => {
    let result = [...data];

    // Priority 1: Category Filter
    if (filterKey && selectedFilter && selectedFilter !== 'all') {
      result = result.filter(item => {
        const val = item[filterKey];
        return String(val) === String(selectedFilter);
      });
    }

    // Priority 2: Search Query
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

    // Priority 3: Sort by column (only when selectedSort is active)
    if (selectedSort && selectedSort !== '_order' && selectedSort !== 'default') {
      result.sort((a, b) => {
        let valA = a[selectedSort];
        let valB = b[selectedSort];

        // If sorting by total_price and total_price is missing, calculate
        if (selectedSort === 'total_price') {
          const numA = (a.total_price !== undefined && a.total_price !== null) 
            ? Number(a.total_price) 
            : (Number(a.unit_price || 0) * Number(a.quantity || 1));
          const numB = (b.total_price !== undefined && b.total_price !== null) 
            ? Number(b.total_price) 
            : (Number(b.unit_price || 0) * Number(b.quantity || 1));
          return sortDir === 'asc' ? numA - numB : numB - numA;
        }

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        // Numeric compare
        const isNumA = typeof valA === 'number' || (!isNaN(Number(valA)) && valA !== '');
        const isNumB = typeof valB === 'number' || (!isNaN(Number(valB)) && valB !== '');
        if (isNumA && isNumB && selectedSort !== 'phone') {
          const nA = Number(valA);
          const nB = Number(valB);
          return sortDir === 'asc' ? nA - nB : nB - nA;
        }

        // Date compare
        if (selectedSort.includes('date') || selectedSort.includes('_at')) {
          const dateA = new Date(valA).getTime() || 0;
          const dateB = new Date(valB).getTime() || 0;
          return sortDir === 'asc' ? dateA - dateB : dateB - dateA;
        }

        // Korean/String locale compare
        const comp = String(valA).localeCompare(String(valB), 'ko-KR', { numeric: true });
        return sortDir === 'asc' ? comp : -comp;
      });
    }

    return result;
  }, [data, filterKey, selectedFilter, searchQuery, searchKeys, selectedSort, sortDir]);

  // 3-Step Sort Toggle: asc -> desc -> default (reset)
  const handleSortToggle = (key) => {
    if (selectedSort === key) {
      if (sortDir === 'asc') {
        setSortDir('desc');
      } else {
        // Return to default (설정순)
        setSelectedSort('');
        setSortDir('asc');
      }
    } else {
      setSelectedSort(key);
      setSortDir('asc');
    }
  };

  // Drag & Drop Handlers
  const handleDragStart = (e, index) => {
    if (!isDefaultOrder || !onReorderRows) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e, index) => {
    if (!isDefaultOrder || !onReorderRows) return;
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    if (!isDefaultOrder || !onReorderRows) return;
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...filteredData];
    const [draggedItem] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);
    onReorderRows(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
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
            {selectedSort && (
              <span style={{
                backgroundColor: '#E8F5E9',
                color: '#2D6A4F',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                정렬: {columns.find(c => c.key === selectedSort)?.label || selectedSort} ({sortDir === 'asc' ? '오름차순' : '내림차순'})
                <button
                  onClick={() => { setSelectedSort(''); setSortDir('asc'); }}
                  style={{ background: 'none', border: 'none', color: '#2D6A4F', cursor: 'pointer', padding: 0, fontWeight: '800', marginLeft: '2px' }}
                  title="기본 설정순으로 초기화"
                >
                  ✕
                </button>
              </span>
            )}
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

      {/* 2. Search & Filter Bar (No sort dropdown - sorting is via column headers) */}
      <div style={{
        padding: '12px 24px',
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
          maxWidth: '380px',
          minWidth: '220px'
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
              padding: '8px 12px 8px 36px',
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

        {/* Right side: Filter & Sort instructions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Category Filter */}
          {filterOptions.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} style={{ color: '#6B6862' }} />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                style={{
                  padding: '7px 10px',
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

          {/* Reordering helper hint */}
          {onReorderRows && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px',
              color: isDefaultOrder ? '#2D6A4F' : '#A09E9B',
              backgroundColor: isDefaultOrder ? '#E8F5E9' : '#F5F4F0',
              padding: '5px 10px',
              borderRadius: '6px',
              fontWeight: '600'
            }}>
              <Info size={13} />
              <span>
                {isDefaultOrder 
                  ? '행 좌측 핸들(:::)을 끌어서 순서를 변경할 수 있습니다.' 
                  : '설정순 정렬 상태에서만 순서 변경이 활성화됩니다.'}
              </span>
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
              borderBottom: '1.5px solid #EAE8E3',
              color: '#6B6862',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}>
              {/* Drag handle column header if reorderable */}
              {onReorderRows && (
                <th style={{ width: '48px', textAlign: 'center', padding: '14px 8px' }}>
                  <span style={{ fontSize: '11px', color: '#A09E9B' }}>순서</span>
                </th>
              )}

              {columns.map(col => {
                const isSortable = col.sortable !== false && col.key !== 'actions' && col.key !== '_order_move' && col.key !== '_order_drag';
                const isSorted = selectedSort === col.key;

                return (
                  <th
                    key={col.key}
                    onClick={() => isSortable && handleSortToggle(col.key)}
                    style={{
                      padding: '14px 18px',
                      width: col.width || 'auto',
                      textAlign: col.align || 'left',
                      cursor: isSortable ? 'pointer' : 'default',
                      userSelect: 'none',
                      whiteSpace: 'nowrap',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { if (isSortable) e.currentTarget.style.backgroundColor = '#F5EFE0'; }}
                    onMouseLeave={(e) => { if (isSortable) e.currentTarget.style.backgroundColor = '#FAF6EE'; }}
                    title={isSortable ? "클릭 시 [오름차순 → 내림차순 → 기본순] 정렬" : undefined}
                  >
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      justifyContent: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start',
                      width: '100%'
                    }}>
                      <span>{col.label}</span>
                      {isSortable && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: '11px',
                          color: isSorted ? '#2D6A4F' : '#B4A078',
                          fontWeight: isSorted ? '900' : 'normal'
                        }}>
                          {isSorted ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (onReorderRows ? 1 : 0)} style={{ padding: '60px 20px', textAlign: 'center' }}>
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
              filteredData.map((row, idx) => {
                const isDraggingThis = draggedIndex === idx;
                const isDragOverThis = dragOverIndex === idx;

                return (
                  <tr
                    key={row[keyField] || idx}
                    draggable={Boolean(isDefaultOrder && onReorderRows)}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDrop={(e) => handleDrop(e, idx)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onRowClick && onRowClick(row)}
                    style={{
                      borderBottom: '1px solid #F0EEE9',
                      backgroundColor: isDragOverThis 
                        ? '#EDF7ED' 
                        : isDraggingThis 
                          ? '#F9F8F6' 
                          : idx % 2 === 1 ? '#FAFAF8' : '#FFFFFF',
                      opacity: isDraggingThis ? 0.45 : 1,
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color 0.15s ease',
                      outline: isDragOverThis ? '2px dashed #2D6A4F' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (!isDragOverThis && !isDraggingThis) {
                        e.currentTarget.style.backgroundColor = '#FFFDF5';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDragOverThis && !isDraggingThis) {
                        e.currentTarget.style.backgroundColor = idx % 2 === 1 ? '#FAFAF8' : '#FFFFFF';
                      }
                    }}
                  >
                    {/* Drag Handle cell */}
                    {onReorderRows && (
                      <td 
                        style={{
                          textAlign: 'center',
                          padding: '14px 6px',
                          cursor: isDefaultOrder ? 'grab' : 'not-allowed',
                          color: isDefaultOrder ? '#6B6862' : '#D0CFCB',
                          userSelect: 'none'
                        }}
                        title={isDefaultOrder ? "끌어서 순서 변경" : "설정순 정렬 상태에서만 순서 변경 가능"}
                      >
                        <GripVertical size={16} style={{ display: 'inline-block', verticalAlign: 'middle' }} />
                      </td>
                    )}

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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
