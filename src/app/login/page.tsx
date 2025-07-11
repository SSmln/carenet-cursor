"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { IoPersonOutline, IoLockClosedOutline } from "react-icons/io5";
import { toast } from "sonner";
import Cookies from "js-cookie"; // 더 이상 직접 사용하지 않으므로 제거

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
// import { useAuthStore } from "@/store/auth";
import { MOCK_USERS } from "@/constants/mock-data";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth";

// 로그인 API 호출을 Next.js API 라우트로 변경
const postUserSignin = async (username: string, password: string) => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "password",
      username: username,
      password: password,
    }).toString(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `로그인 실패: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

const formSchema = z.object({
  username: z.string().min(1, { message: "사용자 이름을 입력해주세요!" }),
  password: z.string().min(1, { message: "비밀번호를 입력해주세요!" }),
});

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const { mutate: handleSignin, isPending } = useMutation<
    any,
    Error,
    { username: string; password: string }
  >({
    mutationFn: ({ username, password }) => postUserSignin(username, password),
    onSuccess: (data) => {
      toast.success("로그인 성공");
      Cookies.set("access_token", data.access_token, {
        expires: 1, // 1일 후 만료}
      });
      router.push("/cctv");
    },
    onError: (error: Error) => {
      toast.error(`로그인 실패: ${error.message}`);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    handleSignin({ username: values.username, password: values.password });
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* 왼쪽 배경 이미지 영역 */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-primary opacity-90"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1638913662735-a13cfc1dd9b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')",
            mixBlendMode: "overlay",
          }}
        ></div>
        <div className="flex flex-col justify-center items-center relative z-10 px-12 text-primary-foreground">
          <div className="flex items-center mb-10">
            <div className="w-12 h-12 bg-card rounded-lg flex items-center justify-center mr-4">
              <span className="text-primary font-bold text-2xl">C</span>
            </div>
            <h1 className="text-4xl font-bold">Carenet</h1>
          </div>
          <h2 className="text-3xl font-bold mb-6">
            실시간 모니터링으로 소중한 사람을 보호하세요
          </h2>
          <p className="text-xl opacity-90 mb-10">
            홈 CCTV 기반 AI 노인 낙상·욕창 모니터링 시스템
          </p>
          <div className="grid grid-cols-2 gap-6 w-full">
            <div className="bg-secondary/30 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">24/7 모니터링</h3>
              <p className="opacity-80">
                연중무휴 실시간 영상 분석으로 즉각적인 대응이 가능합니다.
              </p>
            </div>
            <div className="bg-secondary/30 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">AI 기반 분석</h3>
              <p className="opacity-80">
                정확한 AI 알고리즘으로 낙상과 욕창 위험을 선제적으로 감지합니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 로그인 영역 */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-background">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-10">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mr-4">
              <span className="text-primary-foreground font-bold text-2xl">
                C
              </span>
            </div>
            <h1 className="text-3xl font-bold text-primary">Carenet</h1>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3 text-foreground">
              환영합니다
            </h2>
            <p className="text-muted-foreground">계정 정보로 로그인하세요</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">사용자 이름</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IoPersonOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="사용자 이름"
                          {...field}
                          className="pl-10 h-12 rounded-lg"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">비밀번호</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IoLockClosedOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="비밀번호"
                          {...field}
                          className="pl-10 h-12 rounded-lg"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full h-12 rounded-lg font-medium text-base"
                disabled={isPending}
              >
                {isPending ? "로그인 중..." : "로그인"}
              </Button>
            </form>
          </Form>

          <div className="flex justify-between mt-6 mb-8 text-sm">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              홈으로 돌아가기
            </Link>
            <a
              href="#"
              className="font-medium text-primary hover:text-primary-600 transition-colors"
            >
              비밀번호를 잊으셨나요?
            </a>
          </div>

          <div className="bg-card p-5 rounded-xl border border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">
              테스트 계정 정보
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background p-3 rounded-lg border border-border">
                <div className="text-xs font-semibold mb-1 text-primary">
                  슈퍼 관리자
                </div>
                <div className="text-xs text-muted-foreground">
                  super_admin / password
                </div>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <div className="text-xs font-semibold mb-1 text-primary">
                  병원 관리자
                </div>
                <div className="text-xs text-muted-foreground">
                  hospital_admin / password
                </div>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <div className="text-xs font-semibold mb-1 text-primary">
                  간호사
                </div>
                <div className="text-xs text-muted-foreground">
                  nurse / password
                </div>
              </div>
              <div className="bg-background p-3 rounded-lg border border-border">
                <div className="text-xs font-semibold mb-1 text-primary">
                  관제요원
                </div>
                <div className="text-xs text-muted-foreground">
                  operator / password
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function jwtDecode(access_token: any) {
  throw new Error("Function not implemented.");
}
