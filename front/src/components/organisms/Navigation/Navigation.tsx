/**
 * Navigation Organism
 * 상단 네비게이션 바 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  className?: string;
}

const Navigation: React.FC<NavigationProps> = ({ className }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Home', path: '/', type: 'route' },
    { label: '매매 일지', path: '/trade-journal', type: 'route' },
    { label: '시뮬레이터', path: '/simulator', type: 'route' },
    { label: '차트 보기', path: '/charts', type: 'route' },
    { label: '내 자산', path: '/my-assets', type: 'route' },
  ];

  const handleScrollToSection = (hash: string) => {
    if (location.pathname !== '/') {
      return; // 메인 페이지가 아니면 스크롤 안함
    }

    const element = document.querySelector(hash);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <NavContainer
      as={motion.nav}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      $isScrolled={isScrolled}
      className={className}
    >
      <NavContent>
        <Logo as={Link} to="/">
          <LogoIcon>₿</LogoIcon>
          <LogoText>CryptoPortfolio</LogoText>
        </Logo>

        <MenuList>
          {menuItems.map((item) => (
            <MenuItem key={item.label}>
              {item.type === 'route' ? (
                <MenuLink as={Link} to={item.path}>
                  {item.label}
                </MenuLink>
              ) : (
                <MenuLink
                  as="a"
                  href={item.path}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    handleScrollToSection(item.path);
                  }}
                >
                  {item.label}
                </MenuLink>
              )}
            </MenuItem>
          ))}
        </MenuList>
      </NavContent>
    </NavContainer>
  );
};

export default Navigation;

// Styled Components
const NavContainer = styled.nav<{ $isScrolled: boolean }>`
  position: sticky;
  top: 0;
  width: 100%;
  z-index: 100;
  background: ${(props) =>
    props.$isScrolled
      ? 'rgba(26, 33, 66, 0.85)'
      : 'rgba(26, 33, 66, 0.7)'};
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid ${(props) =>
    props.$isScrolled
      ? 'rgba(148, 163, 184, 0.2)'
      : 'rgba(148, 163, 184, 0.1)'};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${(props) =>
    props.$isScrolled
      ? '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 1px rgba(59, 130, 246, 0.1)'
      : '0 4px 16px rgba(0, 0, 0, 0.3)'};
`;

const NavContent = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media (max-width: 768px) {
    padding: 0.75rem 1rem;
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoIcon = styled.span`
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.5));
`;

const LogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Poppins', sans-serif;
  color: #f8fafc;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);

  @media (max-width: 640px) {
    display: none;
  }
`;

const MenuList = styled.ul`
  display: flex;
  align-items: center;
  gap: 2rem;
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 768px) {
    gap: 1rem;
  }

  @media (max-width: 640px) {
    gap: 0.5rem;
  }
`;

const MenuItem = styled.li`
  position: relative;
`;

const MenuLink = styled.a`
  color: #cbd5e1;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9375rem;
  padding: 0.5rem 0;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  letter-spacing: 0.01em;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, #3b82f6 0%, #10b981 100%);
    border-radius: 2px;
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
  }

  &:hover {
    color: #f8fafc;
    transform: translateY(-1px);

    &::after {
      width: 100%;
    }
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    font-size: 0.875rem;
  }
`;
