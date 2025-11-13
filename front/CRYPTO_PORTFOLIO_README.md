# 🪙 Crypto Portfolio - 암호화폐 포트폴리오 웹사이트

모던하고 미니멀한 디자인의 암호화폐 포트폴리오 웹사이트입니다. React, TypeScript, Styled-components를 활용하여 구축되었으며, Framer Motion으로 극적인 애니메이션 효과를 제공합니다.

## ✨ 주요 기능

### 1. **네비게이션 바**
- Sticky 위치 고정
- 스크롤 시 블러 효과 및 그림자
- 반응형 메뉴

### 2. **Hero Section**
- 대형 비트코인 아이콘 (회전 애니메이션)
- 실시간 비트코인 가격 시뮬레이션
- 24시간 변동률 표시
- CTA 버튼

### 3. **인기 암호화폐 섹션**
- 4개의 코인 카드 (Bitcoin, Ethereum, Ripple, Luna)
- 2x2 그리드 레이아웃 (모바일에서는 1열)
- 각 카드에 미니 차트 표시
- 호버 효과 (살짝 상승 + 그림자 진하게)

### 4. **ROI 계산기 모달 (핵심 기능)**

#### 극적인 애니메이션:
- **배경 오버레이**: 반투명 + 블러 효과
- **카드 확대**: 클릭한 카드가 화면 중앙으로 이동하며 확대
- **Staggered Animation**: 모든 요소가 시차를 두고 등장
- **숫자 카운트업**: 0에서 최종 값까지 부드럽게 증가

#### 주요 정보:
- **투자 요약**: 총 투자금, 현재 가치, 평균 ROI
- **가격 히스토리 차트**:
  - 시간대 선택 (1H, 24H, 7D, 1M, 1Y)
  - TradingView 스타일의 전문적인 차트
  - 그리드 라인, 툴팁
  - 거래량 바 차트
- **통계 카드**:
  - 최고 수익률 (날짜, 금액, 퍼센트)
  - 최저 수익률 (날짜, 금액, 퍼센트)
  - 평균 수익률

## 🎨 디자인 특징

- **배경색**: #E9E9E9 (라이트 그레이)
- **주요 컬러**: #627EEA (블루), #10B981 (그린), #EF4444 (레드)
- **타이포그래피**:
  - 제목: 고딕체, 굵은 폰트
  - 가격: Monospace 폰트 (Courier New)
- **애니메이션**: Framer Motion 활용
- **반응형**: 데스크톱, 태블릿, 모바일 완벽 지원

## 🛠️ 기술 스택

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**:
  - Styled-components (동적 스타일링)
  - Tailwind CSS (유틸리티)
- **Animation**: Framer Motion
- **Charts**: Recharts
- **State Management**: React Hooks
- **Architecture**: Atomic Design Pattern

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── atoms/           # 기본 UI 컴포넌트
│   ├── molecules/       # CoinCard
│   │   └── CoinCard/
│   ├── organisms/       # 복잡한 컴포넌트
│   │   ├── Navigation/
│   │   ├── HeroSection/
│   │   ├── CoinsSection/
│   │   └── ROIModal/
│   └── pages/           # 페이지 컴포넌트
│       └── CryptoPortfolioPage.tsx
├── types/               # TypeScript 타입 정의
│   └── crypto.ts
├── utils/               # 유틸리티 함수
│   └── mockData.ts
├── styles/              # 글로벌 스타일
│   └── global.css
├── App.tsx              # 메인 앱
└── main.tsx             # 엔트리 포인트
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` (또는 표시된 포트)를 열어주세요.

### 3. 빌드

```bash
npm run build
```

### 4. 프리뷰

```bash
npm run preview
```

## 📱 반응형 브레이크포인트

- **Desktop**: 1024px 이상
- **Tablet**: 768px ~ 1024px
- **Mobile**: 768px 이하

## 🎯 주요 컴포넌트 설명

### Navigation (`src/components/organisms/Navigation/Navigation.tsx`)
- Sticky 네비게이션 바
- 스크롤 감지 효과
- 반응형 메뉴

### HeroSection (`src/components/organisms/HeroSection/HeroSection.tsx`)
- 좌우 분할 레이아웃
- 실시간 가격 업데이트 시뮬레이션
- 비트코인 아이콘 애니메이션 (회전 + 떠다니기)

### CoinCard (`src/components/molecules/CoinCard/CoinCard.tsx`)
- 개별 코인 정보 카드
- 미니 차트 (Recharts)
- 클릭 시 모달 오픈

### ROIModal (`src/components/organisms/ROIModal/ROIModal.tsx`)
- 극적인 모달 애니메이션
- 상세 차트 및 통계
- 시간대별 데이터 전환
- 숫자 카운트업 애니메이션

### CoinsSection (`src/components/organisms/CoinsSection/CoinsSection.tsx`)
- 코인 그리드 레이아웃
- 모달 상태 관리
- 데이터 생성 및 전달

## 🔧 커스터마이징

### 코인 데이터 변경

`src/utils/mockData.ts` 파일에서 `MOCK_COINS` 배열을 수정하세요:

```typescript
export const MOCK_COINS: CoinData[] = [
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    currentPrice: 67842.35,
    // ...
  },
  // 새로운 코인 추가
];
```

### 컬러 스킴 변경

각 컴포넌트의 Styled Components에서 컬러를 수정하세요:

```typescript
const CTAButton = styled.a`
  background: #627eea; // 여기를 변경
  // ...
`;
```

### 애니메이션 조정

Framer Motion의 `transition` 속성을 수정하세요:

```typescript
<motion.div
  initial={{ opacity: 0, y: 30 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.8 }} // 여기를 조정
>
```

## 🎨 디자인 가이드라인

### 간격 (Spacing)
- **Small**: 0.5rem (8px)
- **Medium**: 1rem (16px)
- **Large**: 1.5rem (24px)
- **XLarge**: 2rem (32px)

### 타이포그래피
- **Heading 1**: 3.5rem (56px), font-weight: 700
- **Heading 2**: 2.5rem (40px), font-weight: 700
- **Body**: 1rem (16px), font-weight: 400
- **Price**: 1.25rem ~ 2rem, Monospace

### Border Radius
- **Small**: 8px
- **Medium**: 12px
- **Large**: 16px
- **XLarge**: 24px

### Shadows
- **Small**: `0 2px 4px rgba(0,0,0,0.08)`
- **Medium**: `0 4px 12px rgba(0,0,0,0.08)`
- **Large**: `0 8px 20px rgba(0,0,0,0.12)`

## 📊 데이터 구조

### CoinData
```typescript
interface CoinData {
  id: string;
  name: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  logo: string;
  chartData: ChartDataPoint[];
}
```

### ROIStats
```typescript
interface ROIStats {
  maxROI: { date: string; amount: number; percentage: number };
  minROI: { date: string; amount: number; percentage: number };
  averageROI: number;
  totalInvestment: number;
  currentValue: number;
}
```

## 🔐 환경 변수

실제 API를 사용하려면 `.env` 파일을 생성하세요:

```env
VITE_API_URL=https://api.coingecko.com/api/v3
VITE_API_KEY=your_api_key_here
```

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

## 👤 개발자

- **아키텍처**: Atomic Design Pattern
- **스타일링**: Styled-components + Tailwind CSS
- **애니메이션**: Framer Motion
- **차트**: Recharts

## 🔗 참고 자료

- [React Documentation](https://react.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Styled Components](https://styled-components.com/)
- [Recharts](https://recharts.org/)
- [Atomic Design](https://atomicdesign.bradfrost.com/)

---

**Note**: 이 프로젝트는 모의 데이터를 사용합니다. 실제 암호화폐 거래에 사용하지 마세요.
