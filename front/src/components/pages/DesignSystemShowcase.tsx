/**
 * 디자인 시스템 쇼케이스 페이지
 *
 * 모든 컴포넌트의 사용 예시를 보여주는 페이지
 */

import React, { useState } from 'react';
import { Button, Input, Card } from '@atoms';

const DesignSystemShowcase: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`이메일: ${email}\n비밀번호: ${password}`);
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* 헤더 */}
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          🎨 디자인 시스템 쇼케이스
        </h1>
        <p className="text-xl text-gray-600">
          React + TypeScript + Atomic Design 기반 컴포넌트 라이브러리
        </p>
        <div className="mt-6 flex justify-center gap-2 text-sm text-gray-500">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
            Styled-components
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
            CSS Modules
          </span>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
            Tailwind CSS
          </span>
        </div>
      </header>

      {/* 버튼 섹션 */}
      <section className="mb-12">
        <Card padding="lg" shadow="md">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            🔘 Button (Styled-components)
          </h2>

          <div className="space-y-8">
            {/* 변형 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">변형 (Variants)</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="solid" color="primary">
                  Solid
                </Button>
                <Button variant="outline" color="primary">
                  Outline
                </Button>
                <Button variant="ghost" color="primary">
                  Ghost
                </Button>
                <Button variant="link" color="primary">
                  Link
                </Button>
              </div>
            </div>

            {/* 색상 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">색상 (Colors)</h3>
              <div className="flex flex-wrap gap-3">
                <Button color="primary">Primary</Button>
                <Button color="secondary">Secondary</Button>
                <Button color="success">Success</Button>
                <Button color="warning">Warning</Button>
                <Button color="error">Error</Button>
                <Button color="gray">Gray</Button>
              </div>
            </div>

            {/* 크기 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">크기 (Sizes)</h3>
              <div className="flex flex-wrap items-end gap-3">
                <Button size="xs">Extra Small</Button>
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
              </div>
            </div>

            {/* 상태 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">상태 (States)</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Normal</Button>
                <Button disabled>Disabled</Button>
                <Button isLoading loadingText="로딩 중...">
                  Loading
                </Button>
                <Button leftIcon="🚀">With Left Icon</Button>
                <Button rightIcon="→">With Right Icon</Button>
                <Button fullWidth>Full Width</Button>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Input 섹션 */}
      <section className="mb-12">
        <Card padding="lg" shadow="md">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            📝 Input (CSS Modules)
          </h2>

          <div className="space-y-6 max-w-2xl">
            <Input
              label="이메일"
              type="email"
              placeholder="example@email.com"
              helperText="이메일 주소를 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              label="비밀번호"
              type="password"
              placeholder="비밀번호를 입력하세요"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Input
              label="비활성화된 입력"
              type="text"
              placeholder="입력할 수 없습니다"
              disabled
            />

            <Input
              label="에러 상태"
              type="text"
              placeholder="에러가 발생한 입력"
              error="올바른 형식이 아닙니다"
            />

            <Input
              label="읽기 전용"
              type="text"
              value="읽기 전용 값"
              readOnly
            />

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-4">크기</h3>
              <div className="space-y-3">
                <Input size="xs" placeholder="Extra Small" />
                <Input size="sm" placeholder="Small" />
                <Input size="md" placeholder="Medium" />
                <Input size="lg" placeholder="Large" />
                <Input size="xl" placeholder="Extra Large" />
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              fullWidth
              isLoading={isLoading}
              loadingText="제출 중..."
            >
              제출하기
            </Button>
          </div>
        </Card>
      </section>

      {/* Card 섹션 */}
      <section className="mb-12">
        <Card padding="lg" shadow="md">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            🎴 Card (Tailwind CSS)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card padding="md" shadow="sm" hoverable>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                기본 카드
              </h3>
              <p className="text-gray-600">
                호버 효과가 있는 기본 카드입니다.
              </p>
            </Card>

            <Card padding="lg" shadow="md" bordered>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                테두리 카드
              </h3>
              <p className="text-gray-600">
                테두리가 있는 카드입니다.
              </p>
            </Card>

            <Card padding="xl" shadow="lg" rounded="xl" background="gray">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                큰 그림자 카드
              </h3>
              <p className="text-gray-600">
                큰 그림자와 회색 배경을 가진 카드입니다.
              </p>
            </Card>

            <Card
              padding="md"
              shadow="base"
              hoverable
              onClick={() => alert('카드 클릭!')}
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                클릭 가능 카드
              </h3>
              <p className="text-gray-600">
                클릭해보세요!
              </p>
            </Card>

            <Card padding="md" shadow="none" bordered>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                그림자 없음
              </h3>
              <p className="text-gray-600">
                그림자가 없는 카드입니다.
              </p>
            </Card>

            <Card padding="md" shadow="xl" rounded="full">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
                완전히 둥근 카드
              </h3>
              <p className="text-gray-600 text-center">
                둥근 모서리를 가진 카드입니다.
              </p>
            </Card>
          </div>
        </Card>
      </section>

      {/* 색상 팔레트 */}
      <section className="mb-12">
        <Card padding="lg" shadow="md">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            🎨 색상 팔레트 (Design Tokens)
          </h2>

          <div className="space-y-6">
            {/* Primary */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Primary</h3>
              <div className="flex gap-2">
                {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                  <div
                    key={shade}
                    className={`w-16 h-16 rounded-md bg-primary-${shade} flex items-center justify-center text-xs font-semibold ${
                      shade >= 500 ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    {shade}
                  </div>
                ))}
              </div>
            </div>

            {/* Semantic Colors */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Semantic Colors
              </h3>
              <div className="flex gap-4">
                <div className="flex-1 bg-green-500 text-white p-4 rounded-md text-center font-semibold">
                  Success
                </div>
                <div className="flex-1 bg-yellow-500 text-white p-4 rounded-md text-center font-semibold">
                  Warning
                </div>
                <div className="flex-1 bg-red-500 text-white p-4 rounded-md text-center font-semibold">
                  Error
                </div>
                <div className="flex-1 bg-blue-500 text-white p-4 rounded-md text-center font-semibold">
                  Info
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* 타이포그래피 */}
      <section className="mb-12">
        <Card padding="lg" shadow="md">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            📖 타이포그래피
          </h2>

          <div className="space-y-4">
            <div className="text-6xl font-bold">Heading 1</div>
            <div className="text-5xl font-bold">Heading 2</div>
            <div className="text-4xl font-semibold">Heading 3</div>
            <div className="text-3xl font-semibold">Heading 4</div>
            <div className="text-2xl font-medium">Heading 5</div>
            <div className="text-xl font-medium">Heading 6</div>
            <div className="text-base">Body Text (Base)</div>
            <div className="text-sm text-gray-600">Small Text</div>
            <div className="text-xs text-gray-500">Extra Small Text</div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-600 py-8">
        <p>
          💡 이 디자인 시스템은 React + TypeScript + Atomic Design 패턴으로
          구축되었습니다.
        </p>
        <p className="mt-2">
          Figma 디자인을 연동하면 자동으로 컴포넌트를 업데이트할 수 있습니다.
        </p>
      </footer>
    </div>
  );
};

export default DesignSystemShowcase;
