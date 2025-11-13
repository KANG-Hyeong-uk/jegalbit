/**
 * Styled-components 타입 선언
 * theme 객체의 타입을 Styled-components에 주입
 */

import 'styled-components';
import { Theme } from './theme';

declare module 'styled-components' {
  export interface DefaultTheme extends Theme {}
}
