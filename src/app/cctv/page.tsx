'use client';

import { useState, useRef } from 'react';
import { Card, Modal, Select } from 'antd';
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
        <Card title="병실 CCTV 뷰">
          <div className="mb-4">
            <div className="flex flex-wrap gap-4">
              <Select defaultValue="all" style={{ width: 120 }}>
                <Select.Option value="all">모든 층</Select.Option>
                <Select.Option value="floor-1">1층</Select.Option>
                <Select.Option value="floor-2">2층</Select.Option>
                <Select.Option value="floor-3">3층</Select.Option>
                <Select.Option value="floor-4">4층</Select.Option>
              </Select>
              
              <Select 
                defaultValue="grid-4" 
                style={{ width: 120 }}
                onChange={(value) => setGridType(value)}
              >
                <Select.Option value="grid-2">2x2 그리드</Select.Option>
                <Select.Option value="grid-4">4x4 그리드</Select.Option>
                <Select.Option value="custom">커스텀 레이아웃</Select.Option>
              </Select>

              <Select defaultValue="all" style={{ width: 120 }}>
                <Select.Option value="all">모든 상태</Select.Option>
                <Select.Option value="normal">정상</Select.Option>
                <Select.Option value="warning">주의</Select.Option>
                <Select.Option value="danger">위험</Select.Option>
                <Select.Option value="offline">오프라인</Select.Option>
              </Select>
            </div>
          </div>
          
          <div className={`grid ${getGridLayout()} gap-4`}>
            {MOCK_CCTVS.map((cctv) => (
              <div key={cctv.id}>
                <Card 
                  hoverable
                  onClick={() => openCCTVModal(cctv)}
                  className="cursor-pointer h-full"
                  title={
                    <div className="flex justify-between items-center">
                      <span>{cctv.name}</span>
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
                  }
                >
                  <div className="relative pb-[56.25%] overflow-hidden bg-gray-200">
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
                </Card>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      <Modal
        title={selectedCCTV ? `${selectedCCTV.name} 라이브 스트림` : ''}
        open={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={800}
        centered
        styles={{
          body: { padding: 0 }
        }}
      >
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
      </Modal>
    </DashboardLayout>
  );
} 