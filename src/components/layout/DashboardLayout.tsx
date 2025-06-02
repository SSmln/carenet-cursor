'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Button, Menu, Badge, Dropdown, Avatar } from 'antd';
import { BarChartOutlined, EyeOutlined, BellOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, SettingOutlined, UserOutlined, ClockCircleOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // 실시간 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user || !isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  // 현재 활성 메뉴 항목 결정
  const getSelectedKey = () => {
    if (pathname?.includes('/dashboard')) return '1';
    if (pathname?.includes('/cctv')) return '2';
    if (pathname?.includes('/admin')) return '4';
    return '1';
  };

  const sidebarWidth = collapsed ? 'w-20' : 'w-64';
  const transitionClass = 'transition-all duration-300 ease-in-out';

  // 사용자 역할 텍스트
  const getRoleText = (role: string) => {
    switch (role) {
      case 'super_admin': return '슈퍼 관리자';
      case 'hospital_admin': return '병원 관리자';
      case 'nurse': return '간호사';
      case 'monitor': return '관제요원';
      default: return role;
    }
  };

  // 사용자 메뉴 항목
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '프로필 설정',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      onClick: handleLogout,
    },
  ];

  // 메뉴 항목 구성
  const menuItems = [
    {
      key: '1',
      icon: <BarChartOutlined />,
      label: <Link href="/dashboard">대시보드</Link>,
    },
    {
      key: '2',
      icon: <EyeOutlined />,
      label: <Link href="/cctv">CCTV 뷰</Link>,
    },
    {
      key: '3',
      icon: <BellOutlined />,
      label: '알림 관리',
      disabled: true, // 아직 구현되지 않음
    },
  ];

  // 관리자 권한이 있는 경우 관리자 메뉴 추가
  if (user.role === 'super_admin' || user.role === 'hospital_admin') {
    menuItems.push({
      key: '4',
      icon: <SettingOutlined />,
      label: <Link href="/admin">관리자</Link>,
    });
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 사이드바 */}
      <div className={`${sidebarWidth} ${transitionClass} bg-slate-800 text-white fixed h-full shadow-lg z-10`}>
        <div className="p-4 flex justify-between items-center border-b border-slate-700">
          {!collapsed && (
            <Link href="/" className="text-white hover:text-white">
              <h1 className="text-xl font-bold">Carenet</h1>
            </Link>
          )}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined className="text-white" /> : <MenuFoldOutlined className="text-white" />}
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center border-none text-white hover:bg-slate-700"
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[getSelectedKey()]}
          className="bg-slate-800 border-r-0"
          items={menuItems}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <div className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} ${transitionClass} flex flex-col`}>
        {/* 헤더 */}
        <header className="bg-white h-16 flex justify-between items-center px-6 shadow-md border-b">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            <div className="hidden sm:flex items-center text-gray-500 text-sm">
              <ClockCircleOutlined className="mr-1" />
              {currentTime.toLocaleString('ko-KR')}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 알림 아이콘 */}
            <Badge count={5} className="cursor-pointer">
              <BellOutlined className="text-lg text-gray-600 hover:text-blue-600" />
            </Badge>
            
            {/* 사용자 정보 드롭다운 */}
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight"
              arrow={{ pointAtCenter: true }}
            >
              <div className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded-lg">
                <Avatar icon={<UserOutlined />} size="small" />
                <div className="hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{getRoleText(user.role)}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        {/* 콘텐츠 영역 */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
} 