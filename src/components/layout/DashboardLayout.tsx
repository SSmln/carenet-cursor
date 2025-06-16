"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  IoBarChartOutline,
  IoEyeOutline,
  IoNotificationsOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoSettingsOutline,
  IoPersonOutline,
  IoTimeOutline,
  IoChevronBack,
  IoChevronForward,
} from "react-icons/io5";

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
      router.push("/login");
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (!user || !isAuthenticated) {
    return <div className="flex justify-center items-center min-h-screen">로딩 중...</div>;
  }

  const getRoleText = (role: string) => {
    const roles: { [key: string]: string } = {
      super_admin: "슈퍼 관리자",
      hospital_admin: "병원 관리자",
      nurse: "간호사",
      monitor: "관제요원",
    };
    return roles[role] || role;
  };

  const menuItems = [
    { href: "/dashboard", icon: IoBarChartOutline, label: "대시보드" },
    { href: "/cctv", icon: IoEyeOutline, label: "CCTV 뷰" },
    ...(user.role === "super_admin" || user.role === "hospital_admin"
      ? [{ href: "/admin", icon: IoSettingsOutline, label: "관리자" }]
      : []),
  ];

  const sidebarWidth = collapsed ? "w-20" : "w-64";
  const transitionClass = "transition-all duration-300 ease-in-out";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarWidth} ${transitionClass} bg-slate-900 text-white fixed h-full shadow-lg z-20 flex flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-700 h-16 shrink-0">
          {!collapsed && (
            <Link href="/" className="text-white hover:text-white">
              <h1 className="text-xl font-bold">Carenet</h1>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-white hover:bg-slate-700 hover:text-white"
          >
            {collapsed ? <IoChevronForward /> : <IoChevronBack />}
          </Button>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link href={item.href} key={item.href}>
                <Button
                  variant={pathname.startsWith(item.href) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                  {!collapsed && <span>{item.label}</span>}
                </Button>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${collapsed ? "ml-20" : "ml-64"} ${transitionClass} flex flex-col`}>
        {/* Header */}
        <header className="bg-white h-16 flex justify-between items-center px-6 shadow-sm border-b z-10 shrink-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-800">{title}</h1>
            <div className="hidden sm:flex items-center text-gray-500 text-sm">
              <IoTimeOutline className="mr-1.5 h-4 w-4" />
              {currentTime.toLocaleString("ko-KR")}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative cursor-pointer">
              <IoNotificationsOutline className="h-6 w-6 text-gray-600 hover:text-blue-600" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">5</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 cursor-pointer !p-2 h-auto">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{getRoleText(user.role)}</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem disabled>
                  <IoPersonOutline className="mr-2 h-4 w-4" />
                  <span>프로필 설정</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <IoLogOutOutline className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
