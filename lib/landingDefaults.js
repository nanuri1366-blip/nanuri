import React from 'react';
import { 
  Leaf, 
  Sparkles, 
  Smile, 
  Gift, 
  Star, 
  Heart, 
  ShieldCheck, 
  Award, 
  Truck, 
  Clock, 
  Coffee, 
  ShoppingBag, 
  Check, 
  CheckCircle, 
  Sun, 
  Flame, 
  Zap, 
  Tag, 
  Box, 
  Instagram, 
  Facebook, 
  Phone, 
  MapPin, 
  Mail,
  ExternalLink,
  ThumbsUp,
  PackageCheck
} from 'lucide-react';

export const ICON_MAP = {
  Leaf,
  Sparkles,
  Smile,
  Gift,
  Star,
  Heart,
  ShieldCheck,
  Award,
  Truck,
  Clock,
  Coffee,
  ShoppingBag,
  Check,
  CheckCircle,
  Sun,
  Flame,
  Zap,
  Tag,
  Box,
  ThumbsUp,
  PackageCheck,
  Instagram,
  Facebook,
  Phone,
  MapPin,
  Mail,
  ExternalLink
};

export const AVAILABLE_ICON_NAMES = [
  'Leaf', 'Sparkles', 'Smile', 'Gift', 'Star', 'Heart', 
  'ShieldCheck', 'Award', 'Truck', 'Clock', 'Coffee', 'ShoppingBag', 
  'Check', 'CheckCircle', 'Sun', 'Flame', 'Zap', 'Tag', 
  'Box', 'ThumbsUp', 'PackageCheck'
];

export function DynamicIcon({ name, size = 22, color, style = {}, className = '' }) {
  const IconComponent = ICON_MAP[name] || Sparkles;
  return <IconComponent size={size} color={color} style={style} className={className} />;
}

export const DEFAULT_LANDING_CONFIG = {
  header: {
    logoTextEn: "Yuzu",
    logoTextKo: "유자품은 오란다&까부리",
    showSmartStoreBtn: true,
    smartStoreText: "스마트스토어로 구매하기",
    smartStoreUrl: "https://smartstore.naver.com/kkaburioranda/products/12823083471"
  },
  popups: [
    {
      id: "popup_1",
      enabled: false,
      title: "공지사항",
      content: "유자를 품은 오란다&까부리 홈페이지를 방문해 주셔서 감사합니다. 현재 단체 주문은 스마트스토어 또는 고객센터로 직접 문의 주시면 친절하게 안내해 드리겠습니다.",
      image: "",
      link: "https://smartstore.naver.com/kkaburioranda",
      linkText: "자세히 보기"
    }
  ],
  sections: [
    {
      id: "sec_hero",
      type: "hero",
      name: "메인 비주얼 (Hero)",
      enabled: true,
      showInNav: false,
      navLabel: "홈",
      anchor: "hero",
      data: {
        badge: "PREMIUM HANDMADE DESSERT",
        title: "바삭함 속에 피어나는\n싱그러운 유자 향",
        subtitle: "100% 고흥 유자로 담근 유자청과 쌀엿조청의 황금 비율로 탄생한\n끈적임 없고 바삭한 프리미엄 수제 오란다&까부리입니다.",
        image: "images/yuzu_oranda_hero.png",
        ctaText: "스마트스토어로 구매하기",
        ctaLink: "https://smartstore.naver.com/kkaburioranda/products/12823083471",
        storyLinkText: "스토리 읽어보기"
      }
    },
    {
      id: "sec_story",
      type: "story",
      name: "브랜드 스토리 (Brand Story)",
      enabled: true,
      showInNav: true,
      navLabel: "브랜드 스토리",
      anchor: "story",
      data: {
        subtitle: "BRAND STORY",
        title: "자연에서 온 상큼함과\n전통의 만남",
        sectionTitle: "딱딱하고 끈적이는 오란다는 잊으세요.",
        body1: "우리는 오란다를 먹을 때 입천장이 아프거나 이가 끈적여 불편했던 기억에서 출발했습니다. 어떻게 하면 남녀노소 누구나 가볍고 맛있게 한과를 즐길 수 있을까 고민했습니다.",
        body2: "남해안의 따뜻한 햇살을 머금고 자란 100% 국산 유자를 엄선하여 즙을 내고 껍질을 잘게 다져 넣었습니다. 가마솥에 푹 고아낸 쌀조청에 상큼한 유자청을 배합해 한 입 베어 물면 바삭하게 부서지며 향긋한 유자향이 입안 가득 번집니다.",
        featureBadge: "100% 국산 천연 유자",
        featureDesc: "인공 향료나 보존료 없이 오직 진짜 유자만을 가득 담았습니다.",
        featureIcon: "Leaf",
        image: "images/yuzu_classic_oranda.png"
      }
    },
    {
      id: "sec_features",
      type: "features",
      name: "핵심 특장점 (Key Features)",
      enabled: true,
      showInNav: true,
      navLabel: "특장점",
      anchor: "features",
      data: {
        subtitle: "KEY FEATURES",
        title: "유자품은 오란다&까부리의 약속",
        items: [
          {
            id: "feat_1",
            icon: "Sparkles",
            title: "입천장 걱정 없는 바삭함",
            desc: "황금비율 배합비로 딱딱하지 않고 부드럽게 바삭바삭 씹힙니다. 아이부터 어르신까지 안전하게 즐길 수 있습니다."
          },
          {
            id: "feat_2",
            icon: "Smile",
            title: "이에 달라붙지 않는 깔끔함",
            desc: "설탕 대신 국내산 조청을 메인 베이스로 사용하여, 치아에 끈적하게 달라붙지 않아 다 드신 후에도 입안이 깔끔합니다."
          },
          {
            id: "feat_3",
            icon: "Gift",
            title: "정성을 담은 프리미엄 패키지",
            desc: "모든 제품은 개별 밀봉 포장되어 눅눅해지지 않으며, 세련되고 감각적인 상자에 담겨 소중한 분들을 위한 선물로 제격입니다."
          }
        ]
      }
    },
    {
      id: "sec_lineup",
      type: "lineup",
      name: "제품 소개 (Lineup)",
      enabled: true,
      showInNav: true,
      navLabel: "제품 소개",
      anchor: "lineup",
      data: {
        subtitle: "PRODUCT LINEUP",
        title: "상큼함을 담은 라인업",
        items: [
          {
            id: "card_deundeun",
            key: "deundeun",
            name: "[든든세트] 고흥 유자품은 까부리와 오란다",
            desc: "오란다/까부리 선택식 (18개입). 넉넉하게 채워 온 가족이 함께 먹기 좋은 프리미엄 든든세트.",
            originalPrice: 30600,
            price: 27540,
            unit: "(18개입 / 1박스)",
            badge: "Best",
            url: "https://smartstore.naver.com/kkaburioranda/products/12823083471",
            image: ""
          },
          {
            id: "card_silsok",
            key: "silsok",
            name: "[실속세트] 고흥 유자품은 까부리와 오란다",
            desc: "오란다/까부리 선택식 (12개입). 부담 없는 가격과 실속 있는 구성으로 간식용 선물로 가장 추천하는 세트.",
            originalPrice: 20400,
            price: 18360,
            unit: "(12개입 / 1박스)",
            badge: "추천",
            url: "https://smartstore.naver.com/kkaburioranda/products/12823080166",
            image: ""
          },
          {
            id: "card_mini",
            key: "mini",
            name: "[미니세트] 고흥 유자품은 까부리와 오란다",
            desc: "오란다/까부리 선택식 (6개입). 답례품 및 가벼운 체험용으로 안성맞춤인 미니 구성 세트.",
            originalPrice: 10200,
            price: 9180,
            unit: "(6개입 / 1박스)",
            badge: "인기",
            url: "https://smartstore.naver.com/kkaburioranda/products/12823072673",
            image: ""
          },
          {
            id: "card_natgae",
            key: "natgae",
            name: "[낱개] 고흥 유자품은 까부리와 오란다",
            desc: "개별 시식용 오란다 / 까부리 낱개 구성. 가볍게 맛보고 싶을 때 추천하는 싱글 메뉴.",
            originalPrice: 2200,
            price: 2000,
            unit: "(1개입)",
            badge: "낱개",
            url: "https://smartstore.naver.com/kkaburioranda/products/12701706707",
            image: ""
          }
        ]
      }
    },
    {
      id: "sec_reviews",
      type: "reviews",
      name: "고객 후기 (Customer Reviews)",
      enabled: true,
      showInNav: true,
      navLabel: "고객 후기",
      anchor: "reviews",
      data: {
        subtitle: "CUSTOMER REVIEWS",
        title: "먼저 맛보신 분들의 이야기",
        items: [
          {
            id: "rev_1",
            stars: 5,
            text: "기존 오란다는 너무 딱딱해서 이가 아팠는데, 이건 정말 바삭하면서도 부드러워요! 상큼한 유자 맛 덕분에 물리지 않고 계속 들어갑니다. 벌써 두 박스째 주문했네요.",
            author: "김OO 님",
            tag: "구매자 | 유자 클래식 구매"
          },
          {
            id: "rev_2",
            stars: 5,
            text: "부모님 명절 선물용으로 프리미엄 선물세트 사드렸는데 박스 패키지부터 너무 고급스럽다며 아주 기뻐하셨어요. 너무 달지도 않고 유자 향이 은은하게 나니까 아주 만족스럽습니다.",
            author: "이OO 님",
            tag: "구매자 | 프리미엄 선물세트 구매"
          },
          {
            id: "rev_3",
            stars: 5,
            text: "사무실에서 일하면서 하나씩 까먹기 너무 좋아요. 개별 포장이라 위생적이고 끈적이지 않아서 키보드 두드리면서 먹어도 묻지 않는 게 정말 큰 강점입니다. 견과류 든 것도 진짜 고소해요!",
            author: "박OO 님",
            tag: "구매자 | 유자 견과 구매"
          }
        ]
      }
    }
  ],
  footer: {
    brandName: "Yuzu Oranda",
    desc: "바삭함 속에 피어나는 싱그러움. 자연에서 온 유자와 전통 오란다의 맛있는 만남.",
    snsLinks: [
      { id: "sns_insta", platform: "instagram", name: "인스타그램", url: "https://instagram.com", enabled: true },
      { id: "sns_kakao", platform: "kakao", name: "카카오톡", url: "https://pf.kakao.com", enabled: true },
      { id: "sns_facebook", platform: "facebook", name: "페이스북", url: "https://facebook.com", enabled: true }
    ],
    companyInfo: {
      companyName: "유자품은 오란다&까부리",
      representative: "정귀례",
      bizNumber: "566-82-00511",
      orderReport: "제 2026-전남고흥-0000호",
      address: "전남광주통합특별시 고흥군 고흥읍 봉동주공길 9, 1층",
      phone: "061-835-1366",
      email: "nanuri1366@daum.net",
      copyright: "© 2026 유자품은 오란다&까부리. All Rights Reserved."
    }
  }
};

// Available Templates for adding new sections
export const SECTION_TEMPLATES = [
  {
    type: "hero",
    label: "메인 비주얼 배너 (Hero)",
    desc: "대형 타이틀, 소개글, CTA 버튼, 대표 사진으로 구성된 메인 배너",
    createDefault: () => ({
      type: "hero",
      name: "새 메인 비주얼",
      enabled: true,
      showInNav: false,
      navLabel: "홈",
      anchor: `hero_${Date.now()}`,
      data: {
        badge: "NEW PROMOTION",
        title: "새로운 오란다의 시작\n기분 좋은 상큼함",
        subtitle: "달콤하고 부드러운 유자 오란다를 지금 바로 만나보세요.",
        image: "images/yuzu_oranda_hero.png",
        ctaText: "구매하러 가기",
        ctaLink: "https://smartstore.naver.com/kkaburioranda",
        storyLinkText: "자세히 알아보기"
      }
    })
  },
  {
    type: "story",
    label: "스토리 소개 (Brand Story)",
    desc: "브랜드 철학, 재료 소개, 특징 배지, 상세 설명과 이미지 레이아웃",
    createDefault: () => ({
      type: "story",
      name: "새 브랜드 스토리",
      enabled: true,
      showInNav: true,
      navLabel: "브랜드 소개",
      anchor: `story_${Date.now()}`,
      data: {
        subtitle: "OUR STORY",
        title: "정성을 담은 우리 이야기",
        sectionTitle: "좋은 재료로 정직하게 만듭니다.",
        body1: "신선한 국산 원재료와 어머니의 손맛으로 정성스럽게 빚어냅니다.",
        body2: "한 알 한 알 정성을 다해 최고의 맛을 전해드립니다.",
        featureBadge: "100% 국산 재료",
        featureDesc: "인공첨가물 없이 자연의 신선함을 그대로 담았습니다.",
        featureIcon: "Leaf",
        image: "images/yuzu_classic_oranda.png"
      }
    })
  },
  {
    type: "features",
    label: "특장점 카드 그리드 (Key Features)",
    desc: "아이콘과 타이틀, 설명으로 구성된 특장점 카드 목록",
    createDefault: () => ({
      type: "features",
      name: "새 특장점 섹션",
      enabled: true,
      showInNav: true,
      navLabel: "특징 안내",
      anchor: `features_${Date.now()}`,
      data: {
        subtitle: "SPECIAL FEATURES",
        title: "특별한 세 가지 약속",
        items: [
          {
            id: `feat_${Date.now()}_1`,
            icon: "Sparkles",
            title: "신선한 재료",
            desc: "산지 직송 엄선된 최고급 재료만 사용합니다."
          },
          {
            id: `feat_${Date.now()}_2`,
            icon: "ShieldCheck",
            title: "위생적인 공정",
            desc: "철저한 품질 관리와 청결한 시설에서 제조됩니다."
          },
          {
            id: `feat_${Date.now()}_3`,
            icon: "Heart",
            title: "정직한 마음",
            desc: "내 가족이 먹는다는 마음으로 정성을 담았습니다."
          }
        ]
      }
    })
  },
  {
    type: "lineup",
    label: "제품 라인업 카드 (Product Cards)",
    desc: "가격, 할인율, 단위, 구매 버튼이 포함된 상품 소개 카드 그리드",
    createDefault: () => ({
      type: "lineup",
      name: "새 제품 라인업",
      enabled: true,
      showInNav: true,
      navLabel: "추천 상품",
      anchor: `lineup_${Date.now()}`,
      data: {
        subtitle: "SPECIAL LINEUP",
        title: "인기 추천 상품",
        items: [
          {
            id: `card_${Date.now()}_1`,
            key: `custom_${Date.now()}`,
            name: "스페셜 오란다 선물세트",
            desc: "가장 인기 있는 구성으로 준비한 시그니처 세트",
            originalPrice: 25000,
            price: 22000,
            unit: "(1박스)",
            badge: "NEW",
            url: "https://smartstore.naver.com/kkaburioranda",
            image: "https://shop-phinf.pstatic.net/20251214_20/1765696482005znToa_PNG/18622543421055178_1644104875.png?type=o1000"
          }
        ]
      }
    })
  },
  {
    type: "reviews",
    label: "고객 후기 목록 (Customer Reviews)",
    desc: "별점, 구매자 정보, 솔직한 구매 후기 카드 그리드",
    createDefault: () => ({
      type: "reviews",
      name: "새 고객 후기",
      enabled: true,
      showInNav: true,
      navLabel: "이용 후기",
      anchor: `reviews_${Date.now()}`,
      data: {
        subtitle: "REAL REVIEWS",
        title: "고객님들의 리얼 후기",
        items: [
          {
            id: `rev_${Date.now()}_1`,
            stars: 5,
            text: "선물용으로 샀는데 너무 만족스러워요. 포장도 예쁘고 정말 맛있습니다!",
            author: "김OO 님",
            tag: "실제 구매 고객"
          }
        ]
      }
    })
  },
  {
    type: "cta",
    label: "홍보 배너 (Call-To-Action)",
    desc: "중간 강조 문구와 구매 링크 버튼이 있는 전체 너비 배너",
    createDefault: () => ({
      type: "cta",
      name: "새 홍보 배너",
      enabled: true,
      showInNav: false,
      navLabel: "바로가기",
      anchor: `cta_${Date.now()}`,
      data: {
        badge: "SPECIAL OFFER",
        title: "지금 스마트스토어에서\n특별한 혜택을 만나보세요!",
        subtitle: "신규 알림받기 시 할인 쿠폰 증정",
        buttonText: "스마트스토어 바로가기",
        buttonLink: "https://smartstore.naver.com/kkaburioranda"
      }
    })
  }
];

export const SECTION_TEMPLATES_MAP = Object.fromEntries(
  SECTION_TEMPLATES.map(t => [t.type, t])
);

export function createSectionFromTemplate(templateType) {
  const tmpl = SECTION_TEMPLATES.find(t => t.type === templateType);
  if (!tmpl) return null;
  const newSec = tmpl.createDefault();
  newSec.id = `sec_${templateType}_${Date.now()}`;
  return newSec;
}

/**
 * Normalizes any stored landing settings (including older flat formats)
 * into the complete, consistent section-based structure.
 */
export function normalizeLandingSettings(raw) {
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(DEFAULT_LANDING_CONFIG));
  }

  const rawCompany = raw.footer?.companyInfo || {};
  const companyInfo = {
    ...DEFAULT_LANDING_CONFIG.footer.companyInfo,
    companyName: rawCompany.companyName || rawCompany.name || DEFAULT_LANDING_CONFIG.footer.companyInfo.companyName,
    representative: rawCompany.representative || rawCompany.ceo || DEFAULT_LANDING_CONFIG.footer.companyInfo.representative,
    bizNumber: rawCompany.bizNumber || rawCompany.registrationNo || DEFAULT_LANDING_CONFIG.footer.companyInfo.bizNumber,
    orderReport: rawCompany.orderReport || DEFAULT_LANDING_CONFIG.footer.companyInfo.orderReport,
    address: rawCompany.address || DEFAULT_LANDING_CONFIG.footer.companyInfo.address,
    phone: rawCompany.phone || DEFAULT_LANDING_CONFIG.footer.companyInfo.phone,
    email: rawCompany.email || DEFAULT_LANDING_CONFIG.footer.companyInfo.email,
    copyright: rawCompany.copyright || DEFAULT_LANDING_CONFIG.footer.companyInfo.copyright
  };

  const result = {
    header: { ...DEFAULT_LANDING_CONFIG.header, ...(raw.header || {}) },
    footer: {
      ...DEFAULT_LANDING_CONFIG.footer,
      ...(raw.footer || {}),
      snsLinks: Array.isArray(raw.footer?.snsLinks) ? raw.footer.snsLinks : DEFAULT_LANDING_CONFIG.footer.snsLinks,
      companyInfo
    },
    popups: Array.isArray(raw.popups) && raw.popups.length > 0 
      ? raw.popups 
      : (raw.popup ? [raw.popup] : DEFAULT_LANDING_CONFIG.popups),
    sections: []
  };

  // If already has sections array, use it
  if (Array.isArray(raw.sections) && raw.sections.length > 0) {
    result.sections = raw.sections.map(sec => ({
      ...sec,
      data: sec.data || {}
    }));
    return result;
  }

  // Otherwise, synthesize sections array from legacy hero, brandStory, products, etc.
  const sections = JSON.parse(JSON.stringify(DEFAULT_LANDING_CONFIG.sections));

  if (raw.hero) {
    const heroSec = sections.find(s => s.type === 'hero');
    if (heroSec) heroSec.data = { ...heroSec.data, ...raw.hero };
  }

  if (raw.brandStory) {
    const storySec = sections.find(s => s.type === 'story');
    if (storySec) storySec.data = { ...storySec.data, ...raw.brandStory };
  }

  if (raw.products && typeof raw.products === 'object') {
    const lineupSec = sections.find(s => s.type === 'lineup');
    if (lineupSec) {
      if (Array.isArray(raw.products)) {
        lineupSec.data.items = raw.products;
      } else {
        lineupSec.data.items = Object.entries(raw.products).map(([key, prod]) => ({
          id: `card_${key}`,
          key,
          ...prod
        }));
      }
    }
  }

  result.sections = sections;
  return result;
}
