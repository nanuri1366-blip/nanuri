"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  Leaf, 
  Sparkles, 
  Smile, 
  Gift, 
  ChevronLeft,
  ChevronRight, 
  Star, 
  Truck, 
  Clock, 
  User, 
  Phone, 
  Package, 
  Hash, 
  Check, 
  Instagram, 
  Facebook, 
  Menu, 
  X, 
  ArrowRight, 
  PartyPopper 
} from 'lucide-react';

const DEFAULT_LANDING_SETTINGS = {
  popups: [
    {
      id: "popup_1",
      enabled: false,
      title: "공지사항",
      content: "유자를 품은 오란다&까부리 홈페이지를 방문해 주셔서 감사합니다. 현재 단체 주문은 스마트스토어 또는 고객센터로 직접 문의 주시면 친절하게 안내해 드리겠습니다.",
      image: "",
      linkUrl: "https://smartstore.naver.com/kkaburioranda",
      linkText: "자세히 보기"
    }
  ],
  popup: {
    enabled: false,
    title: "공지사항",
    content: "유자를 품은 오란다&까부리 홈페이지를 방문해 주셔서 감사합니다. 현재 단체 주문은 스마트스토어 또는 고객센터로 직접 문의 주시면 친절하게 안내해 드리겠습니다.",
    image: "",
    link: "https://smartstore.naver.com/kkaburioranda"
  },
  hero: {
    badge: "PREMIUM HANDMADE DESSERT",
    title: "바삭함 속에 피어나는\n싱그러운 유자 향",
    subtitle: "100% 고흥 유자로 담근 유자청과 쌀엿조청의 황금 비율로 탄생한\n끈적임 없고 바삭한 프리미엄 수제 오란다&까부리입니다.",
    image: "images/yuzu_oranda_hero.png",
    ctaText: "스마트스토어로 구매하기",
    ctaLink: "https://smartstore.naver.com/kkaburioranda/products/12823083471",
    storyLinkText: "스토리 읽어보기"
  },
  brandStory: {
    subtitle: "BRAND STORY",
    title: "자연에서 온 상큼함과\n전통의 만남",
    sectionTitle: "딱딱하고 끈적이는 오란다는 잊으세요.",
    body1: "우리는 오란다를 먹을 때 입천장이 아프거나 이가 끈적여 불편했던 기억에서 출발했습니다. 어떻게 하면 남녀노소 누구나 가볍고 맛있게 한과를 즐길 수 있을까 고민했습니다.",
    body2: "남해안의 따뜻한 햇살을 머금고 자란 100% 국산 유자를 엄선하여 즙을 내고 껍질을 잘게 다져 넣었습니다. 가마솥에 푹 고아낸 쌀조청에 상큼한 유자청을 배합해 한 입 베어 물면 바삭하게 부서지며 향긋한 유자향이 입안 가득 번집니다.",
    featureBadge: "100% 국산 천연 유자",
    featureDesc: "인공 향료나 보존료 없이 오직 진짜 유자만을 가득 담았습니다.",
    image: "images/yuzu_classic_oranda.png"
  },
  products: {
    deundeun: {
      name: "[든든세트] 고흥 유자품은 까부리와 오란다",
      desc: "오란다/까부리 선택식 (18개입). 넉넉하게 채워 온 가족이 함께 먹기 좋은 프리미엄 든든세트.",
      originalPrice: 30600,
      price: 27540,
      unit: "(18개입 / 1박스)",
      badge: "Best",
      image: "https://shop-phinf.pstatic.net/20251214_20/1765696482005znToa_PNG/18622543421055178_1644104875.png?type=o1000",
      url: "https://smartstore.naver.com/kkaburioranda/products/12823083471"
    },
    silsok: {
      name: "[실속세트] 고흥 유자품은 까부리와 오란다",
      desc: "오란다/까부리 선택식 (12개입). 부담 없는 가격과 실속 있는 구성으로 간식용 선물로 가장 추천하는 세트.",
      originalPrice: 20400,
      price: 18360,
      unit: "(12개입 / 1박스)",
      badge: "추천",
      image: "https://shop-phinf.pstatic.net/20251214_20/1765696482005znToa_PNG/18622543421055178_1644104875.png?type=o1000",
      url: "https://smartstore.naver.com/kkaburioranda/products/12823080166"
    },
    mini: {
      name: "[미니세트] 고흥 유자품은 까부리와 오란다",
      desc: "오란다/까부리 선택식 (6개입). 답례품 및 가벼운 체험용으로 안성맞춤인 미니 구성 세트.",
      originalPrice: 10200,
      price: 9180,
      unit: "(6개입 / 1박스)",
      badge: "인기",
      image: "https://shop-phinf.pstatic.net/20251214_20/1765696482005znToa_PNG/18622543421055178_1644104875.png?type=o1000",
      url: "https://smartstore.naver.com/kkaburioranda/products/12823072673"
    },
    natgae: {
      name: "[낱개] 고흥 유자품은 까부리와 오란다",
      desc: "개별 시식용 오란다 / 까부리 낱개 구성. 가볍게 맛보고 싶을 때 추천하는 싱글 메뉴.",
      originalPrice: 2200,
      price: 2000,
      unit: "(1개입)",
      badge: "낱개",
      image: "https://shop-phinf.pstatic.net/20251214_20/1765696482005znToa_PNG/18622543421055178_1644104875.png?type=o1000",
      url: "https://smartstore.naver.com/kkaburioranda/products/12701706707"
    }
  }
};

export default function Home() {
  // 1. Mobile Menu State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // 2. Inventory & Orders State (Hydration safe)
  const [inventory, setInventory] = useState({ deundeun: 50, silsok: 30, mini: 15, natgae: 100 });
  const [isMounted, setIsMounted] = useState(false);

  // 3. Dynamic Landing Settings & Popup States
  const [landingSettings, setLandingSettings] = useState(DEFAULT_LANDING_SETTINGS);
  const [showPopup, setShowPopup] = useState(false);
  const [currentPopupIndex, setCurrentPopupIndex] = useState(0);

  useEffect(() => {
    setIsMounted(true);
    
    // Load Inventory from Supabase (fallback to localStorage)
    const loadInventory = async () => {
      const dbInv = await supabase.getInventory();
      if (dbInv && dbInv.deundeun !== undefined) {
        setInventory(dbInv);
        localStorage.setItem('yuzu_inventory', JSON.stringify(dbInv));
      } else {
        const savedInv = localStorage.getItem('yuzu_inventory');
        if (savedInv) {
          try {
            const parsed = JSON.parse(savedInv);
            if (parsed.classic !== undefined || parsed.deundeun === undefined) {
              const freshInv = { deundeun: 50, silsok: 30, mini: 15, natgae: 100 };
              setInventory(freshInv);
              localStorage.setItem('yuzu_inventory', JSON.stringify(freshInv));
            } else {
              setInventory(parsed);
            }
          } catch (e) {
            console.error("Failed to parse inventory", e);
            const freshInv = { deundeun: 50, silsok: 30, mini: 15, natgae: 100 };
            setInventory(freshInv);
            localStorage.setItem('yuzu_inventory', JSON.stringify(freshInv));
          }
        } else {
          const defaultInv = { deundeun: 50, silsok: 30, mini: 15, natgae: 100 };
          setInventory(defaultInv);
          localStorage.setItem('yuzu_inventory', JSON.stringify(defaultInv));
        }
      }
    };
    loadInventory();

    // Load Landing Settings
    const loadLanding = async () => {
      // 1. Try local storage first
      const localLanding = localStorage.getItem('yuzu_landing_settings');
      let currentLanding = DEFAULT_LANDING_SETTINGS;
      if (localLanding) {
        try {
          const parsed = JSON.parse(localLanding);
          const rawPopups = Array.isArray(parsed.popups) && parsed.popups.length > 0
            ? parsed.popups
            : (parsed.popup ? [{
                id: 'popup_1',
                enabled: !!parsed.popup.enabled,
                title: parsed.popup.title || '공지사항',
                content: parsed.popup.content || '',
                image: parsed.popup.image || '',
                linkUrl: parsed.popup.link || '',
                linkText: '자세히 보기'
              }] : DEFAULT_LANDING_SETTINGS.popups);

          currentLanding = {
            ...DEFAULT_LANDING_SETTINGS,
            ...parsed,
            popups: rawPopups,
            popup: { ...DEFAULT_LANDING_SETTINGS.popup, ...(parsed.popup || {}) },
            hero: { ...DEFAULT_LANDING_SETTINGS.hero, ...(parsed.hero || {}) },
            brandStory: { ...DEFAULT_LANDING_SETTINGS.brandStory, ...(parsed.brandStory || {}) },
            products: {
              deundeun: { ...DEFAULT_LANDING_SETTINGS.products.deundeun, ...(parsed.products?.deundeun || {}) },
              silsok: { ...DEFAULT_LANDING_SETTINGS.products.silsok, ...(parsed.products?.silsok || {}) },
              mini: { ...DEFAULT_LANDING_SETTINGS.products.mini, ...(parsed.products?.mini || {}) },
              natgae: { ...DEFAULT_LANDING_SETTINGS.products.natgae, ...(parsed.products?.natgae || {}) }
            }
          };
          setLandingSettings(currentLanding);
        } catch(e) {
          console.error(e);
        }
      }

      // 2. Query Supabase
      const dbLanding = await supabase.getLandingSettings();
      if (dbLanding) {
        const rawPopups = Array.isArray(dbLanding.popups) && dbLanding.popups.length > 0
          ? dbLanding.popups
          : (dbLanding.popup ? [{
              id: 'popup_1',
              enabled: !!dbLanding.popup.enabled,
              title: dbLanding.popup.title || '공지사항',
              content: dbLanding.popup.content || '',
              image: dbLanding.popup.image || '',
              linkUrl: dbLanding.popup.link || '',
              linkText: '자세히 보기'
            }] : (currentLanding.popups || DEFAULT_LANDING_SETTINGS.popups));

        currentLanding = {
          ...DEFAULT_LANDING_SETTINGS,
          ...dbLanding,
          popups: rawPopups,
          popup: { ...DEFAULT_LANDING_SETTINGS.popup, ...(dbLanding.popup || {}) },
          hero: { ...DEFAULT_LANDING_SETTINGS.hero, ...(dbLanding.hero || {}) },
          brandStory: { ...DEFAULT_LANDING_SETTINGS.brandStory, ...(dbLanding.brandStory || {}) },
          products: {
            deundeun: { ...DEFAULT_LANDING_SETTINGS.products.deundeun, ...(dbLanding.products?.deundeun || {}) },
            silsok: { ...DEFAULT_LANDING_SETTINGS.products.silsok, ...(dbLanding.products?.silsok || {}) },
            mini: { ...DEFAULT_LANDING_SETTINGS.products.mini, ...(dbLanding.products?.mini || {}) },
            natgae: { ...DEFAULT_LANDING_SETTINGS.products.natgae, ...(dbLanding.products?.natgae || {}) }
          }
        };
        setLandingSettings(currentLanding);
        localStorage.setItem('yuzu_landing_settings', JSON.stringify(currentLanding));
      }

      // 3. Handle notice popup logic
      const activeList = (currentLanding.popups || []).filter(p => p && p.enabled);
      if (activeList.length > 0) {
        const lastClosed = localStorage.getItem('yuzu_popup_last_closed');
        if (lastClosed) {
          const hoursPassed = (Date.now() - Number(lastClosed)) / (1000 * 60 * 60);
          if (hoursPassed >= 24) {
            setShowPopup(true);
          }
        } else {
          setShowPopup(true);
        }
      }
    };
    loadLanding();

    // Scroll listener for header shadow
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

  const activePopups = (landingSettings.popups && landingSettings.popups.length > 0 
    ? landingSettings.popups 
    : [landingSettings.popup]
  ).filter(p => p && p.enabled);

  const safeIndex = currentPopupIndex >= activePopups.length ? 0 : currentPopupIndex;
  const curPopup = activePopups[safeIndex];

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

      {/* Navigation Bar */}
      <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container header-container">
          <a href="#" className="logo">
            <span className="brand-en">Yuzu</span>
            <span className="brand-ko">유자품은 오란다&까부리</span>
          </a>
          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`} id="navMenu">
            <a href="#story" className="nav-link" onClick={() => setIsMenuOpen(false)}>브랜드 스토리</a>
            <a href="#features" className="nav-link" onClick={() => setIsMenuOpen(false)}>특장점</a>
            <a href="#lineup" className="nav-link" onClick={() => setIsMenuOpen(false)}>제품 소개</a>
            <a href="#reviews" className="nav-link" onClick={() => setIsMenuOpen(false)}>고객 후기</a>
            <a href={landingSettings.hero.ctaLink} target="_blank" rel="noopener noreferrer" className="nav-btn" onClick={() => setIsMenuOpen(false)}>{landingSettings.hero.ctaText}</a>
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

      {/* Hero Section */}
      <section className="hero-section" id="hero">
        <div className="hero-bg-overlay"></div>
        <div className="container hero-container">
          <div className="hero-content">
            <span className="hero-badge">{landingSettings.hero.badge}</span>
            <h1 className="hero-title" style={{ whiteSpace: 'pre-wrap' }}>
              {landingSettings.hero.title}
            </h1>
            <p className="hero-subtitle" style={{ whiteSpace: 'pre-wrap' }}>
              {landingSettings.hero.subtitle}
            </p>
            <div className="hero-ctas">
              <a href={landingSettings.hero.ctaLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">{landingSettings.hero.ctaText} <ArrowRight size={18} /></a>
              <a href="#story" className="btn btn-outline">{landingSettings.hero.storyLinkText || "스토리 읽어보기"}</a>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-image-card">
              <img src={landingSettings.hero.image} alt="유자품은 오란다&까부리 메인 비주얼" className="hero-image" />
            </div>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="story-section" id="story">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">{landingSettings.brandStory.subtitle}</span>
            <h2 className="section-title" style={{ whiteSpace: 'pre-wrap' }}>{landingSettings.brandStory.title}</h2>
            <div className="title-underline"></div>
          </div>
          <div className="story-grid">
            <div className="story-text">
              <h3>{landingSettings.brandStory.sectionTitle}</h3>
              <p style={{ whiteSpace: 'pre-wrap' }}>{landingSettings.brandStory.body1}</p>
              <p style={{ whiteSpace: 'pre-wrap' }}>{landingSettings.brandStory.body2}</p>
              <div className="story-features">
                <div className="story-feature-item">
                  <div className="icon-box"><Leaf size={22} /></div>
                  <div>
                    <h4>{landingSettings.brandStory.featureBadge}</h4>
                    <p>{landingSettings.brandStory.featureDesc}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="story-visual">
              <div className="visual-card">
                <div className="visual-deco-circle"></div>
                <img src={landingSettings.brandStory.image} alt="유자 클래식 오란다 제조 과정" className="story-img" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">KEY FEATURES</span>
            <h2 className="section-title">유자품은 오란다&까부리의 약속</h2>
            <div className="title-underline"></div>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Sparkles size={24} /></div>
              <h3>입천장 걱정 없는 바삭함</h3>
              <p>황금비율 배합비로 딱딱하지 않고 부드럽게 바삭바삭 씹힙니다. 아이부터 어르신까지 안전하게 즐길 수 있습니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Smile size={24} /></div>
              <h3>이에 달라붙지 않는 깔끔함</h3>
              <p>설탕 대신 국내산 조청을 메인 베이스로 사용하여, 치아에 끈적하게 달라붙지 않아 다 드신 후에도 입안이 깔끔합니다.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Gift size={24} /></div>
              <h3>정성을 담은 프리미엄 패키지</h3>
              <p>모든 제품은 개별 밀봉 포장되어 눅눅해지지 않으며, 세련되고 감각적인 상자에 담겨 소중한 분들을 위한 선물로 제격입니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Lineup Section */}
      <section className="lineup-section" id="lineup">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">PRODUCT LINEUP</span>
            <h2 className="section-title">상큼함을 담은 라인업</h2>
            <div className="title-underline"></div>
          </div>
          <div className="lineup-grid">
            {Object.entries(landingSettings.products).map(([key, product]) => {
              const hasStock = isMounted && inventory[key] > 0;
              const originalPrice = product.originalPrice || 0;
              const price = product.price || 0;
              const discount = originalPrice > price ? Math.round((originalPrice - price) / originalPrice * 100) : 0;
              return (
                <div key={key} className={`product-card ${!hasStock ? 'sold-out' : ''}`}>
                  {product.badge && <div className={`product-badge ${product.badge === 'Gift' || product.badge === '인기' ? 'accent' : ''}`}>{product.badge}</div>}
                  <div className="product-img-wrapper">
                    <img 
                      src={product.image || "https://shop-phinf.pstatic.net/20251214_20/1765696482005znToa_PNG/18622543421055178_1644104875.png?type=o1000"} 
                      alt={product.name} 
                      className="product-img" 
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name" style={{ fontSize: '17px', minHeight: '52px', lineHeight: '1.4' }}>{product.name}</h3>
                    <p className="product-desc" style={{ fontSize: '13px', marginBottom: '16px' }}>{product.desc}</p>
                    
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
                        <span className="unit">{product.unit}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
                      {hasStock ? (
                        <a 
                          href={product.url}
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

      {/* Customer Reviews Section */}
      <section className="reviews-section" id="reviews">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">CUSTOMER REVIEWS</span>
            <h2 className="section-title">먼저 맛보신 분들의 이야기</h2>
            <div className="title-underline"></div>
          </div>
          <div className="reviews-grid">
            <div className="review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-star" />)}
              </div>
              <p className="review-text">"기존 오란다는 너무 딱딱해서 이가 아팠는데, 이건 정말 바삭하면서도 부드러워요! 상큼한 유자 맛 덕분에 물리지 않고 계속 들어갑니다. 벌써 두 박스째 주문했네요."</p>
              <div className="review-author">
                <div className="author-info">
                  <span className="author-name">김OO 님</span>
                  <span className="author-tag">구매자 | 유자 클래식 구매</span>
                </div>
              </div>
            </div>
            <div className="review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-star" />)}
              </div>
              <p className="review-text">"부모님 명절 선물용으로 프리미엄 선물세트 사드렸는데 박스 패키지부터 너무 고급스럽다며 아주 기뻐하셨어요. 너무 달지도 않고 유자 향이 은은하게 나니까 아주 만족스럽습니다."</p>
              <div className="review-author">
                <div className="author-info">
                  <span className="author-name">이OO 님</span>
                  <span className="author-tag">구매자 | 프리미엄 선물세트 구매</span>
                </div>
              </div>
            </div>
            <div className="review-card">
              <div className="review-stars">
                {[...Array(5)].map((_, i) => <Star key={i} size={18} className="fill-star" />)}
              </div>
              <p className="review-text">"사무실에서 일하면서 하나씩 까먹기 너무 좋아요. 개별 포장이라 위생적이고 끈적이지 않아서 키보드 두드리면서 먹어도 묻지 않는 게 정말 큰 강점입니다. 견과류 든 것도 진짜 고소해요!"</p>
              <div className="review-author">
                <div className="author-info">
                  <span className="author-name">박OO 님</span>
                  <span className="author-tag">구매자 | 유자 견과 구매</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-brand">
            <span className="footer-logo-en">Yuzu Oranda</span>
            <p className="footer-desc">바삭함 속에 피어나는 싱그러움. 자연에서 온 유자와 전통 오란다의 맛있는 만남.</p>
            <div className="sns-links">
              <a href="#" aria-label="인스타그램"><Instagram size={18} /></a>
              <a href="#" aria-label="카카오톡"><span style={{fontSize: '14px', fontWeight: 'bold'}}>Talk</span></a>
              <a href="#" aria-label="페이스북"><Facebook size={18} /></a>
            </div>
          </div>
          <div className="footer-info">
            <h4>회사 및 사업자 정보</h4>
            <p>상호명: 유자품은 오란다&까부리 | 대표자: 정귀례</p>
            <p>사업자등록번호: 566-82-00511 | 통신판매업신고: 제 2026-전남고흥-0000호</p>
            <p>주소: 전남광주통합특별시 고흥군 고흥읍 봉동주공길 9, 1층</p>
            <p>고객센터: 061-835-1366 | 이메일: nanuri1366@daum.net</p>
            <p className="copyright">&copy; 2026 유자품은 오란다&까부리. All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
