'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MOCK_CCTVS } from '@/constants/mock-data';
import { CCTV } from '@/types';

export default function CCTVPage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCCTV, setSelectedCCTV] = useState<CCTV | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [gridType, setGridType] = useState('grid-4');
  
  const openCCTVModal = (cctv: CCTV) => {
    setSelectedCCTV(cctv);
    setModalVisible(true);
    
    // 모달이 열리면 비디오 재생 시작
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.src = cctv.streamUrl;
        videoRef.current.play().catch(e => console.error('비디오 자동 재생 실패:', e));
      }
    }, 300);
  };
  
  const handleModalClose = () => {
    // 모달이 닫히면 비디오 정지
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = '';
    }
    setModalVisible(false);
  };
  
  // 그리드 레이아웃 설정
  const getGridLayout = () => {
    switch(gridType) {
      case 'grid-2': 
        return 'grid-cols-1 sm:grid-cols-2';
      case 'grid-4': 
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      case 'custom': 
        return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3';
      default: 
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };
  
  const getStatusColor = (status: CCTV['status']) => {
    switch (status) {
      case 'normal': return 'green';
      case 'warning': return 'orange';
      case 'danger': return 'red';
      case 'offline': return 'gray';
      default: return 'blue';
    }
  };

  const getStatusText = (status: CCTV['status']) => {
    switch (status) {
      case 'normal': return '정상';
      case 'warning': return '주의';
      case 'danger': return '위험';
      case 'offline': return '오프라인';
      default: return '알 수 없음';
    }
  };
  
  return (
    <DashboardLayout title="CCTV 뷰">
      <div className="mb-6">
        <Card>
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">병실 CCTV 뷰</h2>
            <div className="mb-4">
              <div className="flex flex-wrap gap-4">
                <Select defaultValue="all">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="모든 층" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 층</SelectItem>
                    <SelectItem value="floor-1">1층</SelectItem>
                    <SelectItem value="floor-2">2층</SelectItem>
                    <SelectItem value="floor-3">3층</SelectItem>
                    <SelectItem value="floor-4">4층</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  defaultValue="grid-4"
                  onValueChange={(value) => setGridType(value)}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="그리드 레이아웃" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid-2">2x2 그리드</SelectItem>
                    <SelectItem value="grid-4">4x4 그리드</SelectItem>
                    <SelectItem value="custom">커스텀 레이아웃</SelectItem>
                  </SelectContent>
                </Select>

                <Select defaultValue="all">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="모든 상태" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 상태</SelectItem>
                    <SelectItem value="normal">정상</SelectItem>
                    <SelectItem value="warning">주의</SelectItem>
                    <SelectItem value="danger">위험</SelectItem>
                    <SelectItem value="offline">오프라인</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className={`grid ${getGridLayout()} gap-4`}>
              {MOCK_CCTVS.map((cctv) => (
                <div key={cctv.id}>
                  <Card 
                    onClick={() => openCCTVModal(cctv)}
                    className="cursor-pointer h-full"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{cctv.name}</span>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getStatusColor(cctv.status) }}
                          />
                          <span className="text-xs text-gray-500">
                            {getStatusText(cctv.status)}
                          </span>
                        </div>
                      </div>
                      <div className="relative pb-[56.25%] overflow-hidden bg-gray-200 rounded-md">
                        <video 
                          className="absolute top-0 left-0 w-full h-full object-cover"
                          src={cctv.streamUrl}
                          muted
                          loop
                          playsInline
                          autoPlay
                        />
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {cctv.floor}층 {cctv.roomNumber}호
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
      
      <Dialog open={modalVisible} onOpenChange={setModalVisible}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="p-4">
            <DialogTitle>{selectedCCTV ? `${selectedCCTV.name} 라이브 스트림` : ''}</DialogTitle>
          </DialogHeader>
          {selectedCCTV && (
            <div className="bg-black p-2">
              <div className="mb-2 flex justify-between items-center text-white text-sm">
                <span>{selectedCCTV.floor}층 {selectedCCTV.roomNumber}호</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: getStatusColor(selectedCCTV.status) }}
                  />
                  <span>{getStatusText(selectedCCTV.status)}</span>
                </div>
              </div>
              <video
                ref={videoRef}
                className="w-full h-auto"
                controls
                autoPlay
                muted
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
} 