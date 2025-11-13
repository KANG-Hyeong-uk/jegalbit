# 🎨 Design System Project

React + TypeScript + Atomic Design 패턴 기반의 확장 가능한 디자인 시스템 프로젝트입니다.

## 📋 목차

- [주요 특징](#주요-특징)
- [기술 스택](#기술-스택)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
- [스타일링 전략](#스타일링-전략)
- [컴포넌트 사용법](#컴포넌트-사용법)
- [API 연동](#api-연동)
- [Figma 연동](#figma-연동)
- [개발 가이드](#개발-가이드)

---

## 🌟 주요 특징

- ✅ **TypeScript**: 강력한 타입 시스템으로 안전한 코드 작성
- ✅ **Atomic Design**: 체계적인 컴포넌트 구조 (Atoms → Molecules → Organisms → Templates → Pages)
- ✅ **혼합 스타일링**: Styled-components + CSS Modules + Tailwind CSS
- ✅ **디자인 토큰**: 중앙 집중식 테마 관리 시스템
- ✅ **API 연동**: Axios + React Query로 효율적인 데이터 관리
- ✅ **Figma 통합**: Figma MCP를 통한 디자인 자동 동기화
- ✅ **확장성**: 쉽게 확장 가능한 아키텍처

---

## 🛠️ 기술 스택

### 핵심
- **React 18+**: 최신 React 기능 활용
- **TypeScript 5+**: 타입 안정성
- **Vite**: 빠른 개발 환경

### 스타일링
- **Styled-components**: CSS-in-JS, 동적 스타일링
- **CSS Modules**: 스코프 격리
- **Tailwind CSS**: 유틸리티 우선 CSS

### 상태 관리 & API
- **React Query (@tanstack/react-query)**: 서버 상태 관리
- **Zustand**: 전역 클라이언트 상태 관리
- **Axios**: HTTP 클라이언트

---

## 📁 프로젝트 구조

```
src/
├── assets/              # 정적 리소스
│   ├── images/
│   └── fonts/
├── components/          # Atomic Design 컴포넌트
│   ├── atoms/          # 기본 단위 (Button, Input, Card 등)
│   ├── molecules/      # atoms 조합
│   ├── organisms/      # molecules 조합
│   ├── templates/      # 페이지 레이아웃
│   └── pages/          # 실제 페이지
├── hooks/              # 커스텀 React 훅
├── services/           # 비즈니스 로직
│   ├── api/           # API 클라이언트
│   └── queries/       # React Query 훅
├── store/              # 전역 상태 관리 (Zustand)
├── types/              # TypeScript 타입 정의
│   ├── common.ts      # 공통 타입
│   ├── component.ts   # 컴포넌트 타입
│   └── api.ts         # API 타입
├── utils/              # 유틸리티 함수
├── styles/             # 전역 스타일 & 테마
│   ├── theme.ts       # 디자인 토큰
│   ├── global.css     # 전역 CSS
│   └── styled.d.ts    # Styled-components 타입
├── App.tsx
└── main.tsx
```

---

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일 수정:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=10000
VITE_ENABLE_DEVTOOLS=true
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173 접속

### 4. 빌드

```bash
npm run build
```

### 5. 프리뷰

```bash
npm run preview
```

---

## 🎨 스타일링 전략

이 프로젝트는 **3가지 스타일링 방법을 혼합**하여 각각의 장점을 활용합니다:

### 1. Styled-components
**사용처**: 동적 스타일링이 필요한 컴포넌트 (Button 등)

```tsx
// src/components/atoms/Button/Button.tsx
import styled from 'styled-components';

const StyledButton = styled.button<ButtonProps>`
  background-color: ${({ theme, color }) => theme.colors[color][500]};
  padding: ${({ theme, size }) => theme.spacing[size]};
`;
```

**장점**:
- Props 기반 동적 스타일링
- 테마 객체 직접 접근
- 조건부 스타일 작성 용이

### 2. CSS Modules
**사용처**: 스코프 격리가 중요한 컴포넌트 (Input 등)

```tsx
// src/components/atoms/Input/Input.tsx
import styles from './Input.module.css';

<input className={styles.input} />
```

**장점**:
- 전통적인 CSS 문법
- 자동 스코프 격리
- CSS 파일 분리로 가독성 향상

### 3. Tailwind CSS
**사용처**: 레이아웃 및 유틸리티 스타일 (Card, Layout 등)

```tsx
// src/components/atoms/Card/Card.tsx
<div className="p-4 rounded-lg shadow-md hover:shadow-lg">
  {children}
</div>
```

**장점**:
- 빠른 프로토타이핑
- 일관된 디자인 시스템
- 반응형 디자인 간편

---

## 🧩 컴포넌트 사용법

### Button (Styled-components)

```tsx
import { Button } from '@atoms';

// 기본 사용
<Button variant="solid" color="primary" size="md">
  클릭하세요
</Button>

// 로딩 상태
<Button isLoading loadingText="처리 중...">
  제출
</Button>

// 아이콘 포함
<Button leftIcon="🚀" rightIcon="→">
  시작하기
</Button>

// 전체 너비
<Button fullWidth>
  전체 너비 버튼
</Button>
```

### Input (CSS Modules)

```tsx
import { Input } from '@atoms';
import { useState } from 'react';

const [email, setEmail] = useState('');

<Input
  label="이메일"
  type="email"
  placeholder="example@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  helperText="이메일 주소를 입력하세요"
  required
/>

// 에러 상태
<Input
  label="비밀번호"
  type="password"
  error="비밀번호가 일치하지 않습니다"
/>
```

### Card (Tailwind CSS)

```tsx
import { Card } from '@atoms';

<Card padding="md" shadow="lg" hoverable>
  <h3>카드 제목</h3>
  <p>카드 내용</p>
</Card>

// 클릭 가능한 카드
<Card
  padding="lg"
  shadow="md"
  hoverable
  onClick={() => console.log('클릭!')}
>
  클릭 가능한 카드
</Card>
```

---

## 🔌 API 연동

### Axios 클라이언트

```tsx
// src/services/api/client.ts
import { get, post, put, del } from '@services/api';

// GET 요청
const users = await get<User[]>('/users');

// POST 요청
const newUser = await post<User>('/users', { name: 'John', email: 'john@example.com' });

// PUT 요청
const updatedUser = await put<User>(`/users/${id}`, { name: 'Jane' });

// DELETE 요청
await del(`/users/${id}`);
```

### React Query 훅

```tsx
// src/services/queries/useExample.ts
import { useUsers, useCreateUser } from '@services/queries';

function UserList() {
  // 사용자 목록 조회
  const { data, isLoading, error } = useUsers();

  // 사용자 생성
  const createUser = useCreateUser();

  const handleCreate = () => {
    createUser.mutate({ name: 'John', email: 'john@example.com' });
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러 발생</div>;

  return (
    <div>
      {data?.map(user => <div key={user.id}>{user.name}</div>)}
      <button onClick={handleCreate}>사용자 추가</button>
    </div>
  );
}
```

---

## 🎭 Figma 연동

### 1. Figma 파일 가져오기

실제 Figma 파일 URL이 필요합니다:

```
https://www.figma.com/file/YOUR_FILE_KEY/...
```

### 2. 디자인 토큰 추출

Figma에서 색상, 타이포그래피, 간격 등을 추출하여 `src/styles/theme.ts`에 자동 반영

### 3. 컴포넌트 생성

Figma 컴포넌트를 분석하여 React 컴포넌트 자동 생성 (준비 중)

---

## 📖 개발 가이드

### 새로운 Atom 컴포넌트 추가

1. **컴포넌트 파일 생성**

```tsx
// src/components/atoms/Badge/Badge.tsx
import React from 'react';
import type { BaseComponentProps } from '@types/component';

export interface BadgeProps extends BaseComponentProps {
  variant?: 'solid' | 'outline';
  color?: 'primary' | 'secondary';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'solid', color = 'primary' }) => {
  return (
    <span className={`badge badge-${variant} badge-${color}`}>
      {children}
    </span>
  );
};
```

2. **Export 추가**

```tsx
// src/components/atoms/Badge/index.ts
export { Badge } from './Badge';
export type { BadgeProps } from './Badge';

// src/components/atoms/index.ts
export * from './Badge';
```

### API 엔드포인트 추가

1. **엔드포인트 정의**

```tsx
// src/services/api/endpoints.ts
export const API_ENDPOINTS = {
  PRODUCTS: {
    LIST: '/products',
    DETAIL: (id: string) => `/products/${id}`,
  },
};
```

2. **React Query 훅 생성**

```tsx
// src/services/queries/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { get } from '@services/api';
import { queryKeys } from './queryClient';

export const useProducts = () => {
  return useQuery({
    queryKey: queryKeys.products.all,
    queryFn: () => get('/products'),
  });
};
```

### 타입 추가

```tsx
// src/types/models.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
}
```

---

## 🧪 테스트

```bash
# 유닛 테스트
npm run test

# 커버리지
npm run test:coverage
```

---

## 📦 배포

### Vercel

```bash
npm install -g vercel
vercel
```

### Netlify

```bash
npm run build
# dist 폴더를 Netlify에 배포
```

---

## 🤝 기여 가이드

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

MIT License

---

## 👥 제작자

**SW 멤버십 팀**

---

## 📚 참고 자료

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Atomic Design by Brad Frost](https://atomicdesign.bradfrost.com/)
- [Styled Components](https://styled-components.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Query](https://tanstack.com/query/latest)
