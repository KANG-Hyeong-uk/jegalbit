/**
 * Footer Organism
 * 다단 레이아웃 푸터 컴포넌트
 */

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: '기능 소개', href: '#features' },
      { label: '가격 정책', href: '#pricing' },
      { label: 'API 문서', href: '#api' },
      { label: '로드맵', href: '#roadmap' },
    ],
    company: [
      { label: '회사 소개', href: '#about' },
      { label: '팀', href: '#team' },
      { label: '채용', href: '#careers' },
      { label: '블로그', href: '#blog' },
    ],
    support: [
      { label: '고객 지원', href: '#support' },
      { label: 'FAQ', href: '#faq' },
      { label: '문의하기', href: '#contact' },
      { label: '상태 페이지', href: '#status' },
    ],
    legal: [
      { label: '이용약관', href: '#terms' },
      { label: '개인정보처리방침', href: '#privacy' },
      { label: '쿠키 정책', href: '#cookies' },
      { label: '법적 고지', href: '#legal' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', icon: '𝕏', href: 'https://twitter.com', ariaLabel: 'Twitter' },
    { name: 'GitHub', icon: '⚡', href: 'https://github.com', ariaLabel: 'GitHub' },
    { name: 'Discord', icon: '💬', href: 'https://discord.com', ariaLabel: 'Discord' },
    { name: 'LinkedIn', icon: '💼', href: 'https://linkedin.com', ariaLabel: 'LinkedIn' },
  ];

  return (
    <FooterContainer className={className}>
      <FooterContent>
        <FooterGrid>
          {/* 좌측 소개 섹션 (2열) */}
          <AboutSection>
            <Logo>
              <LogoIcon>₿</LogoIcon>
              <LogoText>CryptoPortfolio</LogoText>
            </Logo>
            <Description>
              실시간 암호화폐 시장 분석과 포트폴리오 관리를 위한 올인원 플랫폼.
              스마트한 투자 결정을 위한 최고의 도구를 제공합니다.
            </Description>
            <SocialLinks>
              {socialLinks.map((social) => (
                <SocialLink
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.ariaLabel}
                >
                  {social.icon}
                </SocialLink>
              ))}
            </SocialLinks>
          </AboutSection>

          {/* 링크 섹션 (3열) */}
          <LinksSection>
            <LinkColumn>
              <ColumnTitle>제품</ColumnTitle>
              <LinkList>
                {footerLinks.product.map((link) => (
                  <LinkItem key={link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </LinkItem>
                ))}
              </LinkList>
            </LinkColumn>

            <LinkColumn>
              <ColumnTitle>회사</ColumnTitle>
              <LinkList>
                {footerLinks.company.map((link) => (
                  <LinkItem key={link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </LinkItem>
                ))}
              </LinkList>
            </LinkColumn>

            <LinkColumn>
              <ColumnTitle>지원</ColumnTitle>
              <LinkList>
                {footerLinks.support.map((link) => (
                  <LinkItem key={link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </LinkItem>
                ))}
              </LinkList>
            </LinkColumn>

            <LinkColumn>
              <ColumnTitle>법률</ColumnTitle>
              <LinkList>
                {footerLinks.legal.map((link) => (
                  <LinkItem key={link.label}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </LinkItem>
                ))}
              </LinkList>
            </LinkColumn>
          </LinksSection>
        </FooterGrid>

        {/* 구분선 */}
        <Divider />

        {/* 저작권 바 */}
        <CopyrightBar>
          <Copyright>
            © {currentYear} CryptoPortfolio. All rights reserved.
          </Copyright>
          <LegalLinks>
            <LegalLink href="#terms">이용약관</LegalLink>
            <LegalSeparator>·</LegalSeparator>
            <LegalLink href="#privacy">개인정보처리방침</LegalLink>
          </LegalLinks>
        </CopyrightBar>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;

// Styled Components
const FooterContainer = styled.footer`
  width: 100%;
  background: #0b2233;
  color: #ffffff;
  margin-top: 40px;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;

  @media (max-width: 768px) {
    padding: 28px 20px;
  }
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 32px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 28px;
  }
`;

const AboutSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LogoIcon = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #627eea;
  text-shadow: 0 2px 8px rgba(98, 126, 234, 0.3);
`;

const LogoText = styled.span`
  font-size: 1.125rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.5px;
`;

const Description = styled.p`
  font-size: 0.875rem;
  line-height: 1.5;
  color: #9ca3af;
  margin: 0;
  max-width: 360px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 4px;
`;

const SocialLink = styled.a`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #e5e7eb;
  border-radius: 8px;
  font-size: 1.125rem;
  text-decoration: none;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #627eea;
    transform: translateY(-2px);
  }

  &:focus {
    outline: 2px solid #627eea;
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
  }
`;

const LinksSection = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const LinkColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ColumnTitle = styled.h3`
  font-size: 0.813rem;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

const LinkList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LinkItem = styled.li`
  margin: 0;
`;

const FooterLink = styled.a`
  font-size: 0.875rem;
  color: #e5e7eb;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-block;
  position: relative;

  &:hover {
    color: #627eea;
    text-decoration: underline;
    transform: translateX(2px);
  }

  &:focus {
    outline: 2px solid #627eea;
    outline-offset: 4px;
    border-radius: 2px;
  }
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 28px 0;
`;

const CopyrightBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 14px 16px;
  }
`;

const Copyright = styled.p`
  font-size: 0.813rem;
  color: #9ca3af;
  margin: 0;
`;

const LegalLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LegalLink = styled.a`
  font-size: 0.813rem;
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: #627eea;
    text-decoration: underline;
  }

  &:focus {
    outline: 2px solid #627eea;
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const LegalSeparator = styled.span`
  color: #9ca3af;
  opacity: 0.5;
`;
