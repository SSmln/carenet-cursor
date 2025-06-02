'use client';

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  // 초기 상태를 브라우저 환경에서만 설정하기 위한 처리
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    // 브라우저 환경인 경우에만 실행
    if (typeof window !== 'undefined') {
      // 핸들러 함수 정의
      const handleResize = () => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      };

      // 초기 창 크기 설정
      handleResize();

      // 이벤트 리스너 등록
      window.addEventListener('resize', handleResize);

      // 클린업 함수
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return windowSize;
} 