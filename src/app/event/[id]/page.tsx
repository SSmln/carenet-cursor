'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Toaster, toast } from 'sonner';
import { IoPlayCircleOutline, IoCheckmarkCircleOutline, IoWarningOutline } from 'react-icons/io5';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { MOCK_EVENTS } from '@/constants/mock-data';
import { Event } from '@/types';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedSnapshot, setSelectedSnapshot] = useState<string | null>(null);

  // useEffect(() => {
  //   // 실제로는 API 호출로 이벤트 상세 정보를 가져올 곳
  //   const eventId = params.id as string;
  //   const foundEvent = MOCK_EVENTS.find(e => e.id === eventId);
  //   if (foundEvent) {
  //     setEvent(foundEvent);
  //   } else {
  //     toast.error('이벤트를 찾을 수 없습니다.');
  //     router.back();
  //   }
  // }, [params.id, router]);

  const handleVideoToggle = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleStatusUpdate = (newStatus: Event['status']) => {
    if (event) {
      setEvent({ ...event, status: newStatus });
      toast.success(`이벤트 상태가 ${newStatus === 'read' ? '확인됨' : '해결됨'}으로 변경되었습니다.`);
    }
  };

  const getSeverityColor = (severity: Event['severity']) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'gold';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const getSeverityBadgeVariant = (severity: Event['severity']) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-amber-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getStatusBadgeVariant = (status: Event['status']) => {
    switch (status) {
      case 'unread': return 'bg-red-500 text-white';
      case 'read': return 'bg-orange-500 text-white';
      case 'resolved': return 'bg-green-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const getEventTypeLabel = (type: Event['type']) => {
    const labels = {
      fall_detected: '낙상 감지',
      fall_predicted: '낙상 예측',
      bedsore_detected: '욕창 감지',
      bedsore_predicted: '욕창 예측',
      curtain: '커튼',
      bed_empty: '침대 비움',
      bed_missing: '병상 없음',
      rail_warning: '난간 주의',
    };
    return labels[type] || type;
  };

  if (!event) {
    return (
      <DashboardLayout title="이벤트 상세">
        <div className="flex justify-center items-center h-64">
          <div>로딩 중...</div>
        </div>
        <Toaster />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="이벤트 상세">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 이벤트 정보 카드 */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">이벤트 정보</h2>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <span className="font-medium w-24">유형:</span>
              <Badge className={getSeverityBadgeVariant(event.severity)}>
                {getEventTypeLabel(event.type)}
              </Badge>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-24">발생 시간:</span>
              <span>{new Date(event.timestamp).toLocaleString('ko-KR')}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-24">위치:</span>
              <span>{event.roomNumber}호 {event.bedNumber}번 침대</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-24">환자:</span>
              <span>{event.patientName || '알 수 없음'}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-24">심각도:</span>
              <Badge className={getSeverityBadgeVariant(event.severity)}>
                {event.severity === 'critical' ? '치명적' :
                 event.severity === 'high' ? '높음' :
                 event.severity === 'medium' ? '보통' : '낮음'}
              </Badge>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-24">신뢰도:</span>
              <span>{event.confidence}%</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium w-24">상태:</span>
              <Badge className={getStatusBadgeVariant(event.status)}>
                {event.status === 'unread' ? '미확인' : 
                 event.status === 'read' ? '확인' : '해결'}
              </Badge>
            </div>
            {event.description && (
              <div className="flex items-center">
                <span className="font-medium w-24">설명:</span>
                <span>{event.description}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-4">
            {event.status === 'unread' && (
              <Button
                onClick={() => handleStatusUpdate('read')}
              >
                <IoCheckmarkCircleOutline className="mr-2 h-4 w-4" />
                확인
              </Button>
            )}
            {event.status !== 'resolved' && (
              <Button
                onClick={() => handleStatusUpdate('resolved')}
              >
                <IoWarningOutline className="mr-2 h-4 w-4" />
                해결
              </Button>
            )}
            <Button variant="outline" onClick={() => router.back()}>
              뒤로 가기
            </Button>
          </div>
        </Card>

        {/* 영상 클립 카드 */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">영상 클립</h2>
          <div className="relative bg-black rounded-lg overflow-hidden">
            {event.videoUrl ? (
              <>
                <video
                  ref={videoRef}
                  className="w-full h-auto"
                  src={event.videoUrl}
                  controls
                />
                <div className="absolute bottom-4 left-4">
                  <Button
                    onClick={handleVideoToggle}
                  >
                    <IoPlayCircleOutline className="mr-2 h-4 w-4" />
                    {isPlaying ? '일시정지' : '재생'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex justify-center items-center h-64 text-white">
                <p>영상 클립이 없습니다</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 스냅샷 갤러리 */}
      {event.snapshotUrl && (
        <Card className="mt-6 p-4">
          <h2 className="text-xl font-semibold mb-4">스냅샷</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="cursor-pointer" onClick={() => setSelectedSnapshot(event.snapshotUrl!)}>
              <img
                src={event.snapshotUrl}
                alt="이벤트 스냅샷"
                className="rounded-lg object-cover w-full h-full"
              />
            </div>
          </div>
        </Card>
      )}

      {/* 이벤트 메타데이터 */}
      {event.metadata && (
        <Card className="mt-6 p-4">
          <h2 className="text-xl font-semibold mb-4">상세 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {event.metadata.algorithmVersion && (
              <div className="flex items-center">
                <span className="font-medium w-32">알고리즘 버전:</span>
                <span>{event.metadata.algorithmVersion}</span>
              </div>
            )}
            {event.metadata.processingTime && (
              <div className="flex items-center">
                <span className="font-medium w-32">처리 시간:</span>
                <span>{event.metadata.processingTime}ms</span>
              </div>
            )}
            {event.metadata.boundingBox && (
              <div className="flex items-center">
                <span className="font-medium w-32">감지 영역:</span>
                <span>
                  x: {event.metadata.boundingBox.x}, y: {event.metadata.boundingBox.y}, 
                  w: {event.metadata.boundingBox.width}, h: {event.metadata.boundingBox.height}
                </span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 스냅샷 모달 (Shadcn Dialog) */}
      <Dialog open={!!selectedSnapshot} onOpenChange={(open) => !open && setSelectedSnapshot(null)}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="p-4">
            <DialogTitle>스냅샷</DialogTitle>
          </DialogHeader>
          {selectedSnapshot && (
            <img src={selectedSnapshot} alt="Snapshot" className="w-full" />
          )}
        </DialogContent>
      </Dialog>
      <Toaster />
    </DashboardLayout>
  );
} 