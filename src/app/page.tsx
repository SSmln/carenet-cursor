import Link from 'next/link';
import { ArrowRight, AlertTriangle, Shield, Activity } from 'lucide-react'; // 아이콘 사용

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <span className="text-2xl font-bold text-primary-500">Carenet</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary-500 transition-colors">기능</a>
            <a href="#solutions" className="text-gray-600 hover:text-primary-500 transition-colors">솔루션</a>
            <a href="#about" className="text-gray-600 hover:text-primary-500 transition-colors">소개</a>
            <Link href="/login" className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors font-medium">
              로그인
            </Link>
          </nav>
          <div className="md:hidden">
            <Link href="/login" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm">
              로그인
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-50 -skew-y-6 origin-top-left transform-gpu -translate-y-32 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                스마트한 <span className="text-primary-500">케어</span>로<br />
                안전을 <span className="text-primary-500">연결</span>합니다
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8">
                홈 CCTV 기반 AI 노인 낙상·욕창 실시간 모니터링 시스템입니다.
                사랑하는 가족의 안전을 Carenet으로 지켜보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg transition-colors font-medium text-lg flex items-center justify-center">
                  대시보드 바로가기 <ArrowRight className="ml-2" size={20} />
                </Link>
                <Link href="/login" className="border border-primary-500 text-primary-500 hover:bg-primary-50 px-8 py-3 rounded-lg transition-colors font-medium text-lg flex items-center justify-center">
                  무료 체험하기
                </Link>
              </div>
            </div>
            <div className="md:w-1/2">
              <div className="relative">
                <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary-100 rounded-full z-0"></div>
                <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-primary-200 rounded-full z-0"></div>
                <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden z-10">
                  <img 
                    src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80" 
                    alt="Care monitoring system" 
                    className="w-full h-auto object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 특징 섹션 */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">왜 <span className="text-primary-500">Carenet</span>인가요?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              24시간 지속적인 모니터링으로 응급 상황에 신속하게 대응하고 예방적 케어를 제공합니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <AlertTriangle className="text-primary-500" size={28} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">실시간 모니터링</h3>
              <p className="text-gray-600">
                AI가 낙상, 욕창 위험을 감지하여 즉시 알림을 제공합니다. 24시간 안전을 확인하세요.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Activity className="text-primary-500" size={28} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">이벤트 상세 확인</h3>
              <p className="text-gray-600">
                감지된 이벤트의 영상 클립과 스냅샷을 통해 상황을 정확히 파악하고 대응할 수 있습니다.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="bg-primary-100 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <Shield className="text-primary-500" size={28} />
              </div>
              <h3 className="text-2xl font-semibold mb-3">사용자 맞춤 설정</h3>
              <p className="text-gray-600">
                병원 및 사용자별 권한 관리, CCTV 뷰 커스터마이징 등 유연한 환경을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="py-20 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">98%</p>
              <p className="text-lg opacity-80">정확도</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">24/7</p>
              <p className="text-lg opacity-80">지속 모니터링</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">10+</p>
              <p className="text-lg opacity-80">제휴 의료기관</p>
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold mb-2">1000+</p>
              <p className="text-lg opacity-80">보호 대상자</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="bg-slate-50 rounded-2xl p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">지금 바로 시작하세요</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              소중한 가족을 위한 스마트한 케어 솔루션, Carenet과 함께하세요.
            </p>
            <Link href="/login" className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-lg transition-colors font-medium text-lg">
              무료로 시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-2xl font-bold text-white">Carenet</span>
              </div>
              <p className="max-w-xs text-slate-400">
                홈 CCTV 기반 AI 노인 낙상·욕창 실시간 모니터링 시스템
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-white font-semibold mb-4">서비스</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">모니터링</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">알림 서비스</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">보고서</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">회사</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">소개</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">블로그</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">연락처</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-white font-semibold mb-4">법적 정보</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">이용약관</a></li>
                  <li><a href="#" className="text-slate-400 hover:text-white transition-colors">개인정보처리방침</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400 text-sm">
            © {new Date().getFullYear()} Carenet. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 