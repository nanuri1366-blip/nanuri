import './globals.css';

export const metadata = {
  title: '유자품은 오란다&까부리 | 상큼달콤 수제 디저트',
  description: '100% 고흥 유자로 담근 유자청과 쌀엿조청의 황금 비율로 탄생한 끈적임 없고 바삭한 프리미엄 수제 오란다&까부리입니다.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700;900&family=Outfit:wght@300;400;600;800;900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
