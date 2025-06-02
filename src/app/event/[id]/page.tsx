'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Tag, Space, Image, Descriptions, Modal, message } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
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

  useEffect(() => {
    // 실제로는 API 호출로 이벤트 상세 정보를 가져올 곳
    const eventId = params.id as string;
    const foundEvent = MOCK_EVENTS.find(e => e.id === eventId);
    if (foundEvent) {
      setEvent(foundEvent);
    } else {
      message.error('이벤트를 찾을 수 없습니다.');
      router.back();
    }
  }, [params.id, router]);

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
      message.success(`이벤트 상태가 ${newStatus === 'read' ? '확인됨' : '해결됨'}으로 변경되었습니다.`);
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
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="이벤트 상세">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 이벤트 정보 카드 */}
        <Card title="이벤트 정보">
          <Descriptions column={1} size="small">
            <Descriptions.Item label="유형">
              <Tag color={getSeverityColor(event.severity)}>
                {getEventTypeLabel(event.type)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="발생 시간">
              {new Date(event.timestamp).toLocaleString('ko-KR')}
            </Descriptions.Item>
            <Descriptions.Item label="위치">
              {event.roomNumber}호 {event.bedNumber}번 침대
            </Descriptions.Item>
            <Descriptions.Item label="환자">
              {event.patientName || '알 수 없음'}
            </Descriptions.Item>
            <Descriptions.Item label="심각도">
              <Tag color={getSeverityColor(event.severity)}>
                {event.severity === 'critical' ? '치명적' :
                 event.severity === 'high' ? '높음' :
                 event.severity === 'medium' ? '보통' : '낮음'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="신뢰도">
              {event.confidence}%
            </Descriptions.Item>
            <Descriptions.Item label="상태">
              <Tag color={event.status === 'unread' ? 'red' : event.status === 'read' ? 'orange' : 'green'}>
                {event.status === 'unread' ? '미확인' : 
                 event.status === 'read' ? '확인' : '해결'}
              </Tag>
            </Descriptions.Item>
            {event.description && (
              <Descriptions.Item label="설명">
                {event.description}
              </Descriptions.Item>
            )}
          </Descriptions>

          <div className="mt-4">
            <Space>
              {event.status === 'unread' && (
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleStatusUpdate('read')}
                >
                  확인
                </Button>
              )}
              {event.status !== 'resolved' && (
                <Button
                  type="primary"
                  icon={<ExclamationCircleOutlined />}
                  onClick={() => handleStatusUpdate('resolved')}
                >
                  해결
                </Button>
              )}
              <Button onClick={() => router.back()}>
                뒤로 가기
              </Button>
            </Space>
          </div>
        </Card>

        {/* 영상 클립 카드 */}
        <Card title="영상 클립">
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
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    onClick={handleVideoToggle}
                  >
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
        <Card title="스냅샷" className="mt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="cursor-pointer">
              <Image
                src={event.snapshotUrl}
                alt="이벤트 스냅샷"
                className="rounded-lg"
                preview={{
                  visible: selectedSnapshot === event.snapshotUrl,
                  onVisibleChange: (visible) => setSelectedSnapshot(visible ? event.snapshotUrl! : null),
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* 이벤트 메타데이터 */}
      {event.metadata && (
        <Card title="상세 정보" className="mt-6">
          <Descriptions column={2} size="small">
            {event.metadata.algorithmVersion && (
              <Descriptions.Item label="알고리즘 버전">
                {event.metadata.algorithmVersion}
              </Descriptions.Item>
            )}
            {event.metadata.processingTime && (
              <Descriptions.Item label="처리 시간">
                {event.metadata.processingTime}ms
              </Descriptions.Item>
            )}
            {event.metadata.boundingBox && (
              <Descriptions.Item label="감지 영역">
                x: {event.metadata.boundingBox.x}, y: {event.metadata.boundingBox.y}, 
                w: {event.metadata.boundingBox.width}, h: {event.metadata.boundingBox.height}
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>
      )}

      {/* 스냅샷 모달 */}
      <Modal
        open={!!selectedSnapshot}
        footer={null}
        onCancel={() => setSelectedSnapshot(null)}
        centered
        width={800}
      >
        {selectedSnapshot && (
          <img src={selectedSnapshot} alt="Snapshot" className="w-full" />
        )}
      </Modal>
    </DashboardLayout>
  );
} 