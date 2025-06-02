'use client';

import { useEffect } from 'react';
import { Card, Statistic, Table, Tag, Select, DatePicker, Button } from 'antd';
import { FallOutlined, AimOutlined, EyeOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EventChart from '@/components/charts/EventChart';
import { useDashboardStore } from '@/store/dashboard';
import { MOCK_EVENTS, MOCK_DASHBOARD_STATS } from '@/constants/mock-data';
import { Event } from '@/types';

const { RangePicker } = DatePicker;

export default function DashboardPage() {
  const router = useRouter();
  const { stats, events, setStats, setEvents } = useDashboardStore();

  useEffect(() => {
    // 실제로는 API 호출로 데이터를 가져올 곳
    setStats(MOCK_DASHBOARD_STATS);
    setEvents(MOCK_EVENTS);
  }, [setStats, setEvents]);

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

  const getSeverityColor = (severity: Event['severity']) => {
    switch (severity) {
      case 'critical': return 'red';
      case 'high': return 'orange';
      case 'medium': return 'gold';
      case 'low': return 'green';
      default: return 'blue';
    }
  };

  const handleEventDetail = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  return (
    <DashboardLayout title="대시보드">
      {/* KPI 카드 섹션 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <Statistic
            title="낙상 감지"
            value={stats?.fallDetected || 0}
            valueStyle={{ color: '#cf1322' }}
            prefix={<FallOutlined />}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="낙상 예측"
            value={stats?.fallPredicted || 0}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<FallOutlined />}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="욕창 감지"
            value={stats?.bedsoreDetected || 0}
            valueStyle={{ color: '#cf1322' }}
            prefix={<AimOutlined />}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="욕창 예측"
            value={stats?.bedsorePredicted || 0}
            valueStyle={{ color: '#fa8c16' }}
            prefix={<AimOutlined />}
          />
        </Card>
      </div>
      
      {/* 추가 KPI 카드들 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="text-center">
          <Statistic
            title="커튼 알림"
            value={stats?.curtainAlerts || 0}
            valueStyle={{ color: '#1890ff' }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="침대 비움"
            value={stats?.bedEmptyAlerts || 0}
            valueStyle={{ color: '#722ed1' }}
            prefix={<ExclamationCircleOutlined />}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="활성 환자"
            value={stats?.totalActivePatients || 0}
            valueStyle={{ color: '#52c41a' }}
            prefix={<EyeOutlined />}
          />
        </Card>
        <Card className="text-center">
          <Statistic
            title="활성 CCTV"
            value={stats?.activeCCTVs || 0}
            valueStyle={{ color: '#52c41a' }}
            prefix={<EyeOutlined />}
          />
        </Card>
      </div>
      
      {/* 필터 섹션 */}
      <Card title="필터" className="mb-6">
        <div className="flex flex-wrap gap-4">
          <Select defaultValue="realtime" style={{ width: 120 }}>
            <Select.Option value="realtime">실시간</Select.Option>
            <Select.Option value="1h">1시간</Select.Option>
            <Select.Option value="24h">24시간</Select.Option>
            <Select.Option value="7d">7일</Select.Option>
          </Select>
          
          <Select defaultValue="all" style={{ width: 120 }}>
            <Select.Option value="all">모든 층</Select.Option>
            <Select.Option value="1">1층</Select.Option>
            <Select.Option value="2">2층</Select.Option>
            <Select.Option value="3">3층</Select.Option>
            <Select.Option value="4">4층</Select.Option>
          </Select>
          
          <Select defaultValue="all" style={{ width: 120 }}>
            <Select.Option value="all">모든 병실</Select.Option>
            <Select.Option value="401">401호</Select.Option>
            <Select.Option value="402">402호</Select.Option>
            <Select.Option value="403">403호</Select.Option>
            <Select.Option value="405">405호</Select.Option>
            <Select.Option value="407">407호</Select.Option>
          </Select>
          
          <RangePicker />
        </div>
      </Card>

      {/* 4칼럼 차트 섹션 - 컴팩트한 버전 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <Card title="시간대별 패턴" size="small" className="h-full">
          <EventChart data={[]} type="bar" height={200} />
        </Card>
        <Card title="유형별 분포" size="small" className="h-full">
          <EventChart data={[]} type="pie" height={200} />
        </Card>
        <Card title="심각도 추세" size="small" className="h-full">
          <EventChart data={[]} type="area" height={200} />
        </Card>
        <Card title="병실별 빈도" size="small" className="h-full">
          <EventChart data={[]} type="horizontal-bar" height={200} />
        </Card>
      </div>

      {/* 요일별 트렌드 차트 - 전체 너비 */}
      <Card title="요일별 이벤트 유형 추세" className="mb-6">
        <EventChart data={[]} type="line" height={280} />
      </Card>
      
      {/* 최근 이벤트 테이블 섹션 */}
      <Card title="최근 이벤트">
        <Table 
          dataSource={events} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
          columns={[
            {
              title: '유형',
              dataIndex: 'type',
              key: 'type',
              render: (type: Event['type'], record: Event) => (
                <Tag color={getSeverityColor(record.severity)}>
                  {getEventTypeLabel(type)}
                </Tag>
              ),
            },
            {
              title: '병실',
              dataIndex: 'roomNumber',
              key: 'roomNumber',
              render: (room: string) => `${room}호`,
            },
            {
              title: '침대',
              dataIndex: 'bedNumber',
              key: 'bedNumber',
              render: (bed: string) => `${bed}번`,
            },
            {
              title: '환자',
              dataIndex: 'patientName',
              key: 'patientName',
              render: (name: string) => name || '-',
            },
            {
              title: '시간',
              dataIndex: 'timestamp',
              key: 'timestamp',
              render: (timestamp: string) => new Date(timestamp).toLocaleString('ko-KR'),
            },
            {
              title: '심각도',
              key: 'severity',
              dataIndex: 'severity',
              render: (severity: Event['severity']) => (
                <Tag color={getSeverityColor(severity)}>
                  {severity === 'critical' ? '치명적' :
                   severity === 'high' ? '높음' :
                   severity === 'medium' ? '보통' : '낮음'}
                </Tag>
              ),
            },
            {
              title: '상태',
              key: 'status',
              dataIndex: 'status',
              render: (status: Event['status']) => (
                <Tag color={status === 'unread' ? 'red' : status === 'read' ? 'orange' : 'green'}>
                  {status === 'unread' ? '미확인' : 
                   status === 'read' ? '확인' : '해결'}
                </Tag>
              ),
            },
            {
              title: '액션',
              key: 'action',
              render: (_, record: Event) => (
                <Button 
                  type="link" 
                  onClick={() => handleEventDetail(record.id)}
                  className="p-0"
                  size="small"
                >
                  상세보기
                </Button>
              ),
            },
          ]}
        />
      </Card>
    </DashboardLayout>
  );
} 