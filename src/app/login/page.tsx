'use client';

import { Button, Form, Input, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { MOCK_USERS } from '@/constants/mock-data';

export default function LoginPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const { setUser } = useAuthStore();

  const onFinish = (values: { username: string; password: string }) => {
    const { username } = values;
    const user = MOCK_USERS.find(u => u.username === username && u.password === 'password');

    if (user) {
      // Zustand store에 사용자 정보 설정
      setUser(user);
      message.success('로그인 성공');
      router.push('/dashboard');
    } else {
      message.error('사용자 이름 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 왼쪽 배경 이미지 영역 */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-primary-600 opacity-90"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.unsplash.com/photo-1638913662735-a13cfc1dd9b2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')",
            mixBlendMode: 'overlay'
          }}
        ></div>
        <div className="flex flex-col justify-center items-center relative z-10 px-12 text-white">
          <div className="flex items-center mb-10">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
              <span className="text-primary-500 font-bold text-2xl">C</span>
            </div>
            <h1 className="text-4xl font-bold">Carenet</h1>
          </div>
          <h2 className="text-3xl font-bold mb-6">실시간 모니터링으로 소중한 사람을 보호하세요</h2>
          <p className="text-xl opacity-90 mb-10">홈 CCTV 기반 AI 노인 낙상·욕창 모니터링 시스템</p>
          <div className="grid grid-cols-2 gap-6 w-full">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">24/7 모니터링</h3>
              <p className="opacity-80">연중무휴 실시간 영상 분석으로 즉각적인 대응이 가능합니다.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-2">AI 기반 분석</h3>
              <p className="opacity-80">정확한 AI 알고리즘으로 낙상과 욕창 위험을 선제적으로 감지합니다.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 로그인 영역 */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-10">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center mr-4">
              <span className="text-white font-bold text-2xl">C</span>
            </div>
            <h1 className="text-3xl font-bold text-primary-500">Carenet</h1>
          </div>
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">환영합니다</h2>
            <p className="text-gray-500">계정 정보로 로그인하세요</p>
          </div>

          <Form
            form={form}
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
            className="w-full"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '사용자 이름을 입력해주세요!' }]}
            >
              <Input 
                prefix={<UserOutlined className="text-gray-400" />} 
                placeholder="사용자 이름" 
                size="large"
                className="rounded-lg py-3 px-4"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '비밀번호를 입력해주세요!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="비밀번호"
                size="large"
                className="rounded-lg py-3 px-4"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                className="rounded-lg h-12 w-full font-medium text-base"
              >
                로그인
              </Button>
            </Form.Item>
            
            <div className="flex justify-between mt-4 mb-8">
              <Link href="/" className="text-gray-500 hover:text-primary-500 transition-colors">
                홈으로 돌아가기
              </Link>
              <a href="#" className="text-primary-500 hover:text-primary-600 transition-colors">
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </Form>

          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">테스트 계정 정보</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg border border-slate-100">
                <div className="text-xs font-semibold mb-1 text-primary-500">슈퍼 관리자</div>
                <div className="text-xs text-gray-600">super_admin / password</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100">
                <div className="text-xs font-semibold mb-1 text-primary-500">병원 관리자</div>
                <div className="text-xs text-gray-600">hospital_admin / password</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100">
                <div className="text-xs font-semibold mb-1 text-primary-500">간호사</div>
                <div className="text-xs text-gray-600">nurse / password</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-100">
                <div className="text-xs font-semibold mb-1 text-primary-500">관제요원</div>
                <div className="text-xs text-gray-600">operator / password</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 