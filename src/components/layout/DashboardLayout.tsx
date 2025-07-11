"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
import Cookies from "js-cookie";
import { useQuery } from "@tanstack/react-query";
import { CurrentTime } from "./currentTime";
import { Events } from "./events";
interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

interface AuthMeParams {
  accessToken: string;
}

// 함수 수정
const getAuthMe = async ({ accessToken }: AuthMeParams) => {
  if (!accessToken) {
    console.error("Access token is missing");
    return null;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://210.94.242.37:7420";
  try {
    const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
      // v1으로 수정
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // accessToken 사용
      },
    });

    if (!response.ok) {
      console.error(
        "사용자 정보 조회 실패:",
        response.status,
        response.statusText
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return null;
  }
};

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const userCookie = Cookies.get("access_token");
  const { user, isAuthenticated, logout, setUser } = useAuthStore();

  const {
    data: userData,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: async () => {
      const result = await getAuthMe({ accessToken: userCookie || "" });
      if (result) {
        setUser(result);
      }
      return result;
    },
    enabled: !!userCookie, // userCookie가 있을 때만 쿼리 실행
  });

  const handleLogout = () => {
    logout();
    Cookies.remove("access_token");
    setUser(null);
    router.push("/login");
  };

  // 로딩 중이거나 사용자가 인증되지 않은 경우 스켈레톤 UI 표시
  if (isPending) {
    return (
      <div className="flex h-screen bg-background">
        <aside
          className={`${collapsed ? "w-20" : "w-64"} bg-red-200 transition-all duration-300 ease-in-out bg-sidebar text-sidebar-foreground fixed h-full shadow-lg  z-20 flex flex-col`}
        >
          <div className="p-4 flex items-center justify-between border-b border-sidebar-border h-16 shrink-0">
            {!collapsed && <Skeleton className="h-6 w-3/4" />}
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <nav className="flex-1 px-2 py-4 space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </nav>
        </aside>

        {/* Main Content Skeleton */}
        <div
          className={`${collapsed ? "ml-20" : "ml-64"} transition-all duration-300 ease-in-out flex-1 flex flex-col`}
        >
          {/* Header Skeleton */}
          <header className="bg-card h-16 flex justify-between items-center px-6 shadow-sm border-b z-10 shrink-0">
            <Skeleton className="h-8 w-48" />
            <div className="flex items-center space-x-4">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </header>

          {/* Content Area Skeleton */}
          <main className="flex-1 p-6 overflow-y-auto">
            <Skeleton className="h-32 w-full mb-4" />
            <Skeleton className="h-48 w-full mb-4" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
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

    ...(user?.role === "super_admin" || user?.role === "hospital_admin"
      ? [{ href: "/admin", icon: IoSettingsOutline, label: "관리자" }]
      : []),
  ];

  const sidebarWidth = collapsed ? "w-20" : "w-64";
  const transitionClass = "transition-all duration-300 ease-in-out";

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${sidebarWidth} ${transitionClass} bg-sidebar border-r-[1px]  text-sidebar-foreground fixed h-full shadow-lg z-20 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-sidebar-border h-16 shrink-0">
          {!collapsed && (
            <Link
              href="/"
              className="text-sidebar-foreground hover:text-sidebar-foreground"
            >
              <h1 className="text-xl font-bold">Carenet</h1>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
                  variant={
                    pathname.startsWith(item.href) ? "secondary" : "ghost"
                  }
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
      <div
        className={`flex-1 ${collapsed ? "ml-20" : "ml-64"} ${transitionClass} flex flex-col`}
      >
        {/* Header */}
        <header className="bg-card h-16 flex justify-between items-center px-6 shadow-sm border-b z-10 shrink-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <CurrentTime />
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative cursor-pointer">
              <Events />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 cursor-pointer !p-2 h-auto"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userData?.avatarUrl} />
                    <AvatarFallback>{userData?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-foreground">
                      {userData?.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {getRoleText(userData?.role)}
                    </div>
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
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
