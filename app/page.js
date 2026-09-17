"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  ChevronLeft,
  ChevronRight, 
  Star, 
  Menu, 
  X, 
  ArrowRight,
  Instagram,
  Facebook
} from 'lucide-react';
import { 
  DEFAULT_LANDING_CONFIG, 
  normalizeLandingSettings, 
  DynamicIcon 
} from '../lib/landingDefaults';

export default function Home() {
  // 1. Mobile Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 2. Inventory & Orders State
  const [inventory, setInventory] = useState({ deundeun: 50, silsok: 30, mini: 15, natgae: 100 });
  const [isMounted, setIsMounted] = useState(false);

  // 3. Dynamic Landing Settings & Popup States
  const [landingSettings, setLandingSettings] = useState(DEFAULT_LANDING_CONFIG);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);

    // Load Inventory from Supabase
    const loadInventory = async () => {
      try {
        const dbInv = await supabase.getInventory();
        if (dbInv && (dbInv.deundeun !== undefined || dbInv.classic !== undefined)) {
          setInventory(dbInv);
        }
      } catch (e) {
        console.warn("Failed to load inventory", e);
      }
    };

    // Load Landing Settings from Supabase
    const loadLandingSettings = async () => {
      try {
        const dbSettings = await supabase.getLandingSettings();
        if (dbSettings) {
          const normalized = normalizeLandingSettings(dbSettings);
          setLandingSettings(normalized);
        }
      } catch (e) {
        console.warn("Failed to load landing settings", e);
      }
    };

    loadInventory();
    loadLandingSettings();

    // Check if popup was dismissed within last 24h
    const lastClosed = localStorage.getItem('yuzu_popup_last_closed');
    const now = Date.now();
    if (!lastClosed || now - parseInt(lastClosed, 10) > 24 * 60 * 60 * 1000) {
      setShowPopup(true);
    }

    // Scroll listener for sticky header
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closePopupFor24Hours = () => {
    localStorage.setItem('yuzu_popup_last_closed', Date.now().toString());
    setShowPopup(false);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const activePopups = (landingSettings.popups || []).filter(p => p && p.enabled);
  const safeIndex = currentPopupIndex >= activePopups.length ? 0 : currentPopupIndex;
  const curPopup = activePopups[safeIndex];

  // Visible sections
  const visibleSections = (landingSettings.sections || []).filter(s => s && s.enabled);
  // Nav items from visible sections that have showInNav: true
  const navSections = visibleSections.filter(s => s.showInNav && s.navLabel && s.anchor);

  return (
    <>
      {/* Notice Popup Modal */}
      {isMounted && showPopup && curPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            width: '100%',
            maxWidth: '400px',
            overflow: 'hidden',
            border: '1.5px solid var(--border-color, #EAE8E3)',
            animation: 'fadeIn 0.3s ease-out',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header with Title & Carousel Arrows */}
            <div style={{
              backgroundColor: 'var(--primary-yuzu, #FFC72C)',
              color: 'var(--text-dark, #2B2A27)',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              {activePopups.length > 1 ? (
                <button 
                  type="button" 
                  onClick={() => setCurrentPopupIndex((prev) => (prev > 0 ? prev - 1 : activePopups.length - 1))}
                  style={{
                    background: 'rgba(0,0,0,0.08)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-dark, #2B2A27)'
                  }}
                  title="이전 공지"
                >
                  <ChevronLeft size={20} />
                </button>
              ) : <div style={{ width: '32px' }} />}

              <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {curPopup.title || "공지사항"}
                </h3>
                {activePopups.length > 1 && (
                  <span style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: '700',
                    backgroundColor: 'rgba(0,0,0,0.12)',
                    padding: '2px 8px',
                    borderRadius: '10px',
                    marginTop: '4px'
                  }}>
                    {safeIndex + 1} / {activePopups.length}
                  </span>
                )}
              </div>

              {activePopups.length > 1 ? (
                <button 
                  type="button" 
                  onClick={() => setCurrentPopupIndex((prev) => (prev < activePopups.length - 1 ? prev + 1 : 0))}
                  style={{
                    background: 'rgba(0,0,0,0.08)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'var(--text-dark, #2B2A27)'
                  }}
                  title="다음 공지"
                >
                  <ChevronRight size={20} />
                </button>
              ) : <div style={{ width: '32px' }} />}
            </div>

            {/* Optional Image */}
            {curPopup.image && (
              <div style={{ width: '100%', maxHeight: '200px', overflow: 'hidden', backgroundColor: '#F8F9FA' }}>
                <img 
                  src={curPopup.image} 
                  alt={curPopup.title || "공지 이미지"} 
                  style={{ width: '100%', height: '100%', maxHeight: '200px', objectFit: 'cover' }} 
                />
              </div>
            )}

            {/* Content Area */}
            <div style={{ padding: '22px 20px', textAlign: 'center' }}>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-dark, #2B2A27)',
                lineHeight: '1.65',
                margin: 0,
                whiteSpace: 'pre-wrap',
                fontWeight: '500'
              }}>
                {curPopup.content}
              </p>
              
              {(curPopup.linkUrl || curPopup.link) && (
                <a 
                  href={curPopup.linkUrl || curPopup.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    display: 'inline-flex',
                    marginTop: '18px',
                    width: '100%',
                    justifyContent: 'center',
                    padding: '11px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '14px',
                    textDecoration: 'none',
                    backgroundColor: 'var(--accent-green, #2D6A4F)',
                    color: 'white'
                  }}
                >
                  {curPopup.linkText || "자세히 보기"} <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </a>
              )}
            </div>

            {/* Carousel Dots if multiple */}
            {activePopups.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', paddingBottom: '14px' }}>
                {activePopups.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentPopupIndex(idx)}
                    style={{
                      width: idx === safeIndex ? '16px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: idx === safeIndex ? 'var(--primary-yuzu, #FFC72C)' : '#DDD',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    aria-label={`공지 ${idx + 1} 보기`}
                  />
                ))}
              </div>
            )}

            {/* Actions Bar */}
            <div style={{
              display: 'flex',
              borderTop: '1.5px solid var(--border-color, #EAE8E3)',
              backgroundColor: '#FAF9F6'
            }}>
              <button 
                onClick={closePopupFor24Hours}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'var(--text-muted, #6B6862)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  outline: 'none'
                }}
              >
                오늘 하루 보지 않기
              </button>
              <button 
                onClick={closePopup}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'none',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: 'var(--text-dark, #2B2A27)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  borderLeft: '1.5px solid var(--border-color, #EAE8E3)',
                  outline: 'none'
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Bar (Dynamic GNB) */}
      <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container header-container">
          <a href="#" className="logo">
            <span className="brand-en">{landingSettings.header?.logoTextEn || "Yuzu"}</span>
            <span className="brand-ko">{landingSettings.header?.logoTextKo || "유자품은 오란다&까부리"}</span>
          </a>
          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`} id="navMenu">
            {navSections.map(s => (
              <a 
                key={s.id} 
                href={`#${s.anchor}`} 
                className="nav-link" 
                onClick={() => setIsMenuOpen(false)}
              >
                {s.navLabel}
              </a>
            ))}

            {landingSettings.header?.showSmartStoreBtn !== false && (
              <a 
                href={landingSettings.header?.smartStoreUrl || "https://smartstore.naver.com/kkaburioranda/products/12823083471"} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="nav-btn" 
                onClick={() => setIsMenuOpen(false)}
              >
                {landingSettings.header?.smartStoreText || "스마트스토어로 구매하기"}
              </a>
            )}
          </nav>
          <button 
            className="mobile-menu-toggle" 
            id="menuToggle" 
            aria-label="메뉴 토글"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Dynamic Sections Loop */}
      {visibleSections.map((section) => {
        const { type, anchor, data } = section;

        // 1. Hero Section
        if (type === 'hero') {
          return (
            <section key={section.id} className="hero-section" id={anchor || "hero"}>
              <div className="hero-bg-overlay"></div>
              <div className="container hero-container">
                <div className="hero-content">
                  {data.badge && <span className="hero-badge">{data.badge}</span>}
                  <h1 className="hero-title" style={{ whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                    {data.title}
                  </h1>
                  <p className="hero-subtitle" style={{ whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                    {data.subtitle}
                  </p>
                  <div className="hero-ctas">
                    {data.ctaText && (
                      <a href={data.ctaLink || "#"} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                        {data.ctaText} <ArrowRight size={18} />
                      </a>
                    )}
                    {data.storyLinkText && (
                      <a href="#story" className="btn btn-outline">
                        {data.storyLinkText}
                      </a>
                    )}
                  </div>
                </div>
                <div className="hero-image-wrapper">
                  <div className="hero-image-card">
                    <img src={data.image || "images/yuzu_oranda_hero.png"} alt="메인 비주얼" className="hero-image" />
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 2. Brand Story Section
        if (type === 'story') {
          return (
            <section key={section.id} className="story-section" id={anchor || "story"}>
              <div className="container">
                <div className="section-header text-center">
                  {data.subtitle && <span className="section-subtitle">{data.subtitle}</span>}
                  <h2 className="section-title" style={{ whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                    {data.title}
                  </h2>
                  <div className="title-underline"></div>
                </div>
                <div className="story-grid">
                  <div className="story-text">
                    {data.sectionTitle && <h3>{data.sectionTitle}</h3>}
                    {data.body1 && <p style={{ whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>{data.body1}</p>}
                    {data.body2 && <p style={{ whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>{data.body2}</p>}
                    {(data.featureBadge || data.featureDesc) && (
                      <div className="story-features">
                        <div className="story-feature-item">
                          <div className="icon-box">
                            <DynamicIcon name={data.featureIcon || 'Leaf'} size={22} />
                          </div>
                          <div>
                            {data.featureBadge && <h4>{data.featureBadge}</h4>}
                            {data.featureDesc && <p>{data.featureDesc}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="story-visual">
                    <div className="visual-card">
                      <div className="visual-deco-circle"></div>
                      <img src={data.image || "images/yuzu_classic_oranda.png"} alt="브랜드 스토리" className="story-img" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        }

        // 3. Key Features Section
        if (type === 'features') {
          const items = Array.isArray(data.items) ? data.items : [];
          return (
            <section key={section.id} className="features-section" id={anchor || "features"}>
              <div className="container">
                <div className="section-header text-center">
                  {data.subtitle && <span className="section-subtitle">{data.subtitle}</span>}
                  <h2 className="section-title" style={{ whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                    {data.title}
                  </h2>
                  <div className="title-underline"></div>
                </div>
                <div className="features-grid">
                  {items.map((item, idx) => (
                    <div key={item.id || idx} className="feature-card">
                      <div className="feature-icon">
                        <DynamicIcon name={item.icon || 'Sparkles'} size={24} />
                      </div>
                      <h3 style={{ whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>{item.title}</h3>
                      <p style={{ wordBreak: 'keep-all' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // 4. Product Lineup Section
        if (type === 'lineup') {
          const items = Array.isArray(data.items) ? data.items : [];
          return (
            <section key={section.id} className="lineup-section" id={anchor || "lineup"}>
              <div className="container">
                <div className="section-header text-center">
                  {data.subtitle && <span className="section-subtitle">{data.subtitle}</span>}
                  <h2 className="section-title" style={{ whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                    {data.title}
                  </h2>
                  <div className="title-underline"></div>
                </div>
                <div className="lineup-grid">
                  {items.map((product, idx) => {
                    const stockKey = product.key || product.id;
                    const hasStock = isMounted ? (inventory[stockKey] !== undefined ? inventory[stockKey] > 0 : true) : true;
                    const originalPrice = product.originalPrice || 0;
                    const price = product.price || 0;
                    const discount = originalPrice > price ? Math.round((originalPrice - price) / originalPrice * 100) : 0;

                    return (
                      <div key={product.id || idx} className={`product-card ${!hasStock ? 'sold-out' : ''}`}>
                        {product.badge && (
                          <div className={`product-badge ${product.badge === 'Gift' || product.badge === '인기' ? 'accent' : ''}`}>
                            {product.badge}
                          </div>
                        )}
                        <div className="product-img-wrapper">
                          <img 
                            src={product.image || "https://shop-phinf.pstatic.net/20251214_20/1765696482005znToa_PNG/18622543421055178_1644104875.png?type=o1000"} 
                            alt={product.name} 
                            className="product-img" 
                          />
                        </div>
                        <div className="product-info">
                          <h3 className="product-name" style={{ fontSize: '17px', minHeight: '52px', lineHeight: '1.4', whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                            {product.name}
                          </h3>
                          <p className="product-desc" style={{ fontSize: '13px', marginBottom: '16px', wordBreak: 'keep-all' }}>
                            {product.desc}
                          </p>
                          
                          {/* Price with Original Price and Discount */}
                          <div className="product-price" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px', marginBottom: '16px' }}>
                            {discount > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '13px' }}>
                                  {originalPrice.toLocaleString()}원
                                </span>
                                <span style={{ backgroundColor: 'var(--primary-yuzu-light)', color: 'var(--text-dark)', padding: '1px 5px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                                  -{discount}%
                                </span>
                              </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '2px' }}>
                              <span className="price" style={{ fontSize: '20px' }}>{price.toLocaleString()}원</span>
                              {product.unit && <span className="unit">{product.unit}</span>}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                            {hasStock ? (
                              <a 
                                href={product.url || "https://smartstore.naver.com/kkaburioranda"}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="product-buy-btn"
                                style={{
                                  backgroundColor: 'var(--accent-green)',
                                  color: 'white',
                                  borderRadius: 'var(--radius-sm)',
                                  textDecoration: 'none',
                                  padding: '12px 0',
                                  textAlign: 'center',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  fontWeight: '700',
                                  width: '100%'
                                }}
                              >
                                스마트스토어로 구매
                              </a>
                            ) : (
                              <button 
                                disabled
                                className="product-buy-btn"
                                style={{
                                  backgroundColor: 'var(--bg-warm-cream)',
                                  color: 'rgba(60, 50, 40, 0.4)',
                                  border: '1px solid rgba(180, 160, 120, 0.2)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '12px 0',
                                  textAlign: 'center',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '14px',
                                  fontWeight: '700',
                                  width: '100%',
                                  cursor: 'not-allowed'
                                }}
                              >
                                품절 (Sold Out)
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        }

        // 5. Customer Reviews Section
        if (type === 'reviews') {
          const items = Array.isArray(data.items) ? data.items : [];
          return (
            <section key={section.id} className="reviews-section" id={anchor || "reviews"}>
              <div className="container">
                <div className="section-header text-center">
                  {data.subtitle && <span className="section-subtitle">{data.subtitle}</span>}
                  <h2 className="section-title" style={{ whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                    {data.title}
                  </h2>
                  <div className="title-underline"></div>
                </div>
                <div className="reviews-grid">
                  {items.map((rev, idx) => (
                    <div key={rev.id || idx} className="review-card">
                      <div className="review-stars">
                        {[...Array(rev.stars || 5)].map((_, i) => (
                          <Star key={i} size={18} className="fill-star" />
                        ))}
                      </div>
                      <p className="review-text" style={{ wordBreak: 'keep-all', whiteSpace: 'pre-line' }}>
                        "{rev.text}"
                      </p>
                      <div className="review-author">
                        <div className="author-info">
                          <span className="author-name">{rev.author}</span>
                          <span className="author-tag">{rev.tag}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        // 6. Call To Action (Banner)
        if (type === 'cta') {
          return (
            <section key={section.id} id={anchor || "cta"} style={{
              backgroundColor: 'var(--accent-green, #2D6A4F)',
              color: 'white',
              padding: '64px 20px',
              textAlign: 'center'
            }}>
              <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                {data.badge && (
                  <span style={{
                    display: 'inline-block',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '800',
                    letterSpacing: '1px',
                    marginBottom: '16px'
                  }}>
                    {data.badge}
                  </span>
                )}
                <h2 style={{
                  fontSize: '32px',
                  fontWeight: '800',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-line',
                  wordBreak: 'keep-all',
                  marginBottom: '16px',
                  color: 'white'
                }}>
                  {data.title}
                </h2>
                {data.subtitle && (
                  <p style={{ fontSize: '16px', opacity: 0.9, whiteSpace: 'pre-line', wordBreak: 'keep-all', marginBottom: '28px' }}>
                    {data.subtitle}
                  </p>
                )}
                {data.buttonText && (
                  <a
                    href={data.buttonLink || "https://smartstore.naver.com/kkaburioranda"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{
                      padding: '14px 32px',
                      fontSize: '16px',
                      fontWeight: '800',
                      backgroundColor: 'var(--primary-yuzu, #FFC72C)',
                      color: 'var(--text-dark, #2B2A27)'
                    }}
                  >
                    {data.buttonText} <ArrowRight size={18} />
                  </a>
                )}
              </div>
            </section>
          );
        }

        return null;
      })}

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <span className="footer-logo-en">{landingSettings.footer?.brandName || "Yuzu Oranda"}</span>
            <p className="footer-desc" style={{ wordBreak: 'keep-all' }}>
              {landingSettings.footer?.desc || "바삭함 속에 피어나는 싱그러움. 자연에서 온 유자와 전통 오란다의 맛있는 만남."}
            </p>
            
            {/* SNS links (filtered by enabled) */}
            <div className="sns-links">
              {(landingSettings.footer?.snsLinks || [])
                .filter(sns => sns.enabled !== false)
                .map((sns) => {
                  if (sns.platform === 'instagram') {
                    return (
                      <a key={sns.id} href={sns.url} target="_blank" rel="noopener noreferrer" aria-label="인스타그램">
                        <Instagram size={18} />
                      </a>
                    );
                  }
                  if (sns.platform === 'kakao') {
                    return (
                      <a key={sns.id} href={sns.url} target="_blank" rel="noopener noreferrer" aria-label="카카오톡">
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Talk</span>
                      </a>
                    );
                  }
                  if (sns.platform === 'facebook') {
                    return (
                      <a key={sns.id} href={sns.url} target="_blank" rel="noopener noreferrer" aria-label="페이스북">
                        <Facebook size={18} />
                      </a>
                    );
                  }
                  return (
                    <a key={sns.id} href={sns.url} target="_blank" rel="noopener noreferrer" aria-label={sns.name}>
                      <DynamicIcon name="ExternalLink" size={16} />
                    </a>
                  );
                })}
            </div>
          </div>

          <div className="footer-info">
            <h4>회사 및 사업자 정보</h4>
            <p>
              상호명: {landingSettings.footer?.companyInfo?.companyName || "유자품은 오란다&까부리"} | 대표자: {landingSettings.footer?.companyInfo?.representative || "정귀례"}
            </p>
            <p>
              사업자등록번호: {landingSettings.footer?.companyInfo?.bizNumber || "566-82-00511"} | 통신판매업신고: {landingSettings.footer?.companyInfo?.orderReport || "제 2026-전남고흥-0000호"}
            </p>
            <p>
              주소: {landingSettings.footer?.companyInfo?.address || "전남광주통합특별시 고흥군 고흥읍 봉동주공길 9, 1층"}
            </p>
            <p>
              고객센터: {landingSettings.footer?.companyInfo?.phone || "061-835-1366"} | 이메일: {landingSettings.footer?.companyInfo?.email || "nanuri1366@daum.net"}
            </p>
            <p className="copyright">
              {landingSettings.footer?.companyInfo?.copyright || "© 2026 유자품은 오란다&까부리. All Rights Reserved."}
            </p>

            {/* Quick Gate Links */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '14px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
              <a href="/admin" style={{ color: 'inherit', textDecoration: 'underline' }}>관리자 모드</a>
              <span>|</span>
              <a href="/producer" style={{ color: 'inherit', textDecoration: 'underline' }}>생산자 모드</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
