"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { ko } from 'date-fns/locale';

import {
  IoBodyOutline,
  IoBandageOutline,
  IoEyeOutline,
  IoAlertCircleOutline,
  IoCalendarOutline
} from "react-icons/io5";

import DashboardLayout from "@/components/layout/DashboardLayout";
import EventChart from "@/components/charts/EventChart";
import { useDashboardStore } from "@/store/dashboard";
import { MOCK_EVENTS, MOCK_DASHBOARD_STATS } from "@/constants/mock-data";
import { Event } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const kpiCardData = [
  { key: 'fallDetected', title: '낙상 감지', icon: IoBodyOutline, color: 'text-red-600' },
  { key: 'fallPredicted', title: '낙상 예측', icon: IoBodyOutline, color: 'text-orange-500' },
  { key: 'bedsoreDetected', title: '욕창 감지', icon: IoBandageOutline, color: 'text-red-600' },
  { key: 'bedsorePredicted', title: '욕창 예측', icon: IoBandageOutline, color: 'text-orange-500' },
  { key: 'curtainAlerts', title: '커튼 알림', icon: IoAlertCircleOutline, color: 'text-blue-500' },
  { key: 'bedEmptyAlerts', title: '침대 비움', icon: IoAlertCircleOutline, color: 'text-purple-500' },
  { key: 'totalActivePatients', title: '활성 환자', icon: IoEyeOutline, color: 'text-green-500' },
  { key: 'activeCCTVs', title: '활성 CCTV', icon: IoEyeOutline, color: 'text-green-500' },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const { stats, events, setStats, setEvents } = useDashboardStore();
  const [date, setDate] = useState<DateRange | undefined>();

  useEffect(() => {
    setStats(MOCK_DASHBOARD_STATS);
    setEvents(MOCK_EVENTS);
  }, [setStats, setEvents]);

  const getEventTypeLabel = (type: Event["type"]) => {
    const labels: Record<Event["type"], string> = {
      fall_detected: "낙상 감지",
      fall_predicted: "낙상 예측",
      bedsore_detected: "욕창 감지",
      bedsore_predicted: "욕창 예측",
      curtain: "커튼",
      bed_empty: "침대 비움",
      bed_missing: "병상 없음",
      rail_warning: "난간 주의",
    };
    return labels[type] || type;
  };

  const getSeverityBadgeVariant = (severity: Event["severity"]) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "secondary"; // Use custom color for high
      case "medium": return "default";
      case "low": return "outline";
      default: return "default";
    }
  };

  const handleEventDetail = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  return (
    <DashboardLayout title="대시보드">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {kpiCardData.map(item => {
          const Icon = item.icon;
          return (
            <Card key={item.key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                <Icon className={`h-4 w-4 text-muted-foreground ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${item.color}`}>{stats?.[item.key] || 0}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="mb-6">
        <CardContent className="flex flex-wrap items-center gap-4 p-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="모든 이벤트 유형" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 이벤트 유형</SelectItem>
              <SelectItem value="fall_detected">낙상 감지</SelectItem>
              <SelectItem value="fall_predicted">낙상 예측</SelectItem>
              <SelectItem value="bedsore_detected">욕창 감지</SelectItem>
              <SelectItem value="bedsore_predicted">욕창 예측</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="모든 심각도" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 심각도</SelectItem>
              <SelectItem value="critical">치명적</SelectItem>
              <SelectItem value="high">높음</SelectItem>
              <SelectItem value="medium">보통</SelectItem>
              <SelectItem value="low">낮음</SelectItem>
            </SelectContent>
          </Select>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[260px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <IoCalendarOutline className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y", { locale: ko })} -{" "}
                      {format(date.to, "LLL dd, y", { locale: ko })}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y", { locale: ko })
                  )
                ) : (
                  <span>기간 선택</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={ko}
              />
            </PopoverContent>
          </Popover>
          <Button>필터 적용</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle className="text-base">시간대별 패턴</CardTitle></CardHeader>
          <CardContent><EventChart data={[]} type="bar" height={200} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">유형별 분포</CardTitle></CardHeader>
          <CardContent><EventChart data={[]} type="pie" height={200} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">심각도 추세</CardTitle></CardHeader>
          <CardContent><EventChart data={[]} type="area" height={200} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">병실별 빈도</CardTitle></CardHeader>
          <CardContent><EventChart data={[]} type="horizontal-bar" height={200} /></CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader><CardTitle>요일별 이벤트 유형 추세</CardTitle></CardHeader>
          <CardContent><EventChart data={[]} type="line" height={280} /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>최근 이벤트</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>유형</TableHead>
                <TableHead>병실</TableHead>
                <TableHead>침대</TableHead>
                <TableHead>환자</TableHead>
                <TableHead>시간</TableHead>
                <TableHead>심각도</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>액션</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <Badge variant={getSeverityBadgeVariant(event.severity)} className={cn(event.severity === 'high' && 'bg-orange-100 text-orange-800 border-orange-200')}>
                      {getEventTypeLabel(event.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.roomNumber}호</TableCell>
                  <TableCell>{event.bedNumber}번</TableCell>
                  <TableCell>{event.patientName || "-"}</TableCell>
                  <TableCell>{new Date(event.timestamp).toLocaleString("ko-KR")}</TableCell>
                  <TableCell>
                    <Badge variant={getSeverityBadgeVariant(event.severity)} className={cn(event.severity === 'high' && 'bg-orange-100 text-orange-800 border-orange-200')}>
                      {event.severity === "critical" ? "치명적" : event.severity === "high" ? "높음" : event.severity === "medium" ? "보통" : "낮음"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.status === 'unread' ? 'destructive' : event.status === 'read' ? 'secondary' : 'default'}>
                      {event.status === "unread" ? "미확인" : event.status === "read" ? "확인" : "해결"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="link" className="p-0 h-auto" onClick={() => handleEventDetail(event.id)}>
                      상세보기
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
