import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ConfigProvider } from 'antd';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ReactQueryProvider } from '@/lib/react-query';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Carenet",
  description: "AI 기반 노인 낙상·욕창 모니터링 시스템",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ReactQueryProvider>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: { 
                  colorPrimary: '#1677ff',
                  borderRadius: 4,
                },
              }}
            >
              {children}
            </ConfigProvider>
          </AntdRegistry>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
