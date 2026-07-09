import { Outfit, Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '600', '800', '900'],
  variable: '--font-outfit',
});

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-noto-sans-kr',
});

export const metadata = {
  title: '유자품은 오란다&까부리 | 상큼달콤 수제 디저트',
  description: '100% 고흥 유자로 담근 유자청과 쌀엿조청의 황금 비율로 탄생한 끈적임 없고 바삭한 프리미엄 수제 오란다&까부리입니다.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={`${outfit.variable} ${notoSansKr.variable}`}>
        {children}
      </body>
    </html>
  );
}
