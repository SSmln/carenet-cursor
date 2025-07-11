"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MOCK_CCTVS } from "@/constants/mock-data"; // 이 부분은 사용되지 않을 수 있습니다.
import { CCTV, Event } from "@/types"; // Event와 CCTV 인터페이스 임포트
import ReactPlayer from "react-player"; // 이 부분은 현재 사용되지 않을 수 있습니다.
import { useMutation, useQueries } from "@tanstack/react-query";
import Cookies from "js-cookie"; // 이 부분은 현재 사용되지 않을 수 있습니다.
import { isPageStatic } from "next/dist/build/utils"; // 이 부분은 현재 사용되지 않을 수 있습니다.
import { useRouter } from "next/navigation";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useDashboardStore } from "@/store/dashboard";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function CCTVPage() {
  const { stats, events, setStats, setEvents } = useDashboardStore();
  console.log(events);

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCCTV, setSelectedCCTV] = useState<CCTV | null>(null);
  const [gridType, setGridType] = useState("grid-4");
  const router = useRouter();
  const cctvIds = [
    "6853abdea8c3d423cecc84da",
    "68639825d1f07bb25c82dee7",
    "6863982ed1f07bb25c82dee8",
    "68639835d1f07bb25c82dee9",
  ];

  const cctvQueries = useQueries({
    queries: cctvIds.map((id) => ({
      queryKey: ["cctvStream", id],
      queryFn: async () => `/api/stream/${id}`, // Next.js API 라우트 URL 반환
      staleTime: Infinity, // 스트림 URL은 변하지 않으므로 무한대로 설정
      gcTime: Infinity,
    })),
  });

  console.log("CCTV 스트림 쿼리 결과:", cctvQueries);
  const openCCTVModal = (cctv: CCTV) => {
    setSelectedCCTV(cctv);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCCTV(null);
  };

  // 이전 getEventTypeLabel 함수는 Event 인터페이스 변경으로 더 이상 필요하지 않습니다.
  // event_type에 따라 뱃지 variant를 반환하는 함수
  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case "fall":
        return "destructive"; // 낙상: 위험 (빨간색)
      case "bedsore":
        return "warning"; // 욕창: 주의 (노란색)
      case "bed_empty":
        return "secondary"; // 침대 비움: 보조 (회색)
      // 필요한 경우 다른 event_type에 대한 케이스 추가
      default:
        return "default"; // 기타: 기본 (파란색 또는 흰색)
    }
  };

  const transitionEventType = (eventType: string) => {
    switch (eventType) {
      case "destructive":
        return "낙상"; // 낙상: 위험 (빨간색)
      case "warning":
        return "욕창"; // 욕창: 주의 (노란색)
      case "secondary":
        return "침대 비움"; // 침대 비움: 보조 (회색)
      // 필요한 경우 다른 event_type에 대한 케이스 추가
      default:
        return "default"; // 기타: 기본 (파란색 또는 흰색)
    }
  };

  // getSeverityBadgeVariant 함수는 새로운 Event 스키마에 severity 필드가 없으므로 제거합니다.

  const handleEventDetail = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const getStreamUrl = (url: string) => {
    return url.endsWith("/") ? `${url}playlist.m3u8` : `${url}/playlist.m3u8`;
  };

  const getGridLayout = () => {
    switch (gridType) {
      case "grid-2":
        return "grid-cols-1 sm:grid-cols-2";
      case "grid-4":
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
      case "custom":
        return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3";
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    }
  };

  // CCTV 상태 관련 함수들은 Event 스키마 변경과 직접적인 관련이 없으므로 유지합니다.
  const getStatusColor = (status: CCTV["status"]) => {
    switch (status) {
      case "normal":
        return "green";
      case "warning":
        return "orange";
      case "danger":
        return "red";
      case "offline":
        return "gray";
      default:
        return "blue";
    }
  };

  const getStatusText = (status: CCTV["status"]) => {
    switch (status) {
      case "normal":
        return "정상";
      case "warning":
        return "주의";
      case "danger":
        return "위험";
      case "offline":
        return "오프라인";
      default:
        return "알 수 없음";
    }
  };

  // 클릭시 -> 처리
  // 낙상
  // 욕창

  // 스테이더스 라벨 없애기

  // 베드 아이디 필요없음
  //  환자 아이디 만들어야함

  // 최근이벤트 크기 고정

  const tranferBedIdToIndex = (bedId) => {
    // "6853abdea8c3d423cecc84da",
    // "68639825d1f07bb25c82dee7",
    // "6863982ed1f07bb25c82dee8",
    // "68639835d1f07bb25c82dee9",

    switch (bedId) {
      case "6853abdea8c3d423cecc84da":
        return "1번 침대"; // 낙상: 위험 (빨간색)
      case "68639825d1f07bb25c82dee7":
        return "2번 침대"; // 욕창: 주의 (노란색)
      case "6863982ed1f07bb25c82dee8":
        return "3번 침대"; // 침대 비움: 보조 (회색)

      case "68639835d1f07bb25c82dee9":
        return "4번 침대";
      // 필요한 경우 다른 event_type에 대한 케이스 추가
      default:
        return "default"; // 기타: 기본 (파란색 또는 흰색)
    }
  };

  return (
    <DashboardLayout title="CCTV 뷰">
      <div className="mb-6 flex flex-col space-y-4">
        <Card className="">
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
              {cctvQueries.map((query, index) => (
                <Card
                  key={cctvIds[index]}
                  className="cursor-pointer h-full p-0 hover:border-destructive"
                >
                  <div className="p-4 border-border-gray-200 rounded-md ">
                    {query.isPending ? (
                      <div className="flex justify-center items-center min-h-[200px]">
                        <span className="text-gray-500">로딩 중...</span>
                      </div>
                    ) : query.isError ? (
                      <div className="flex justify-center items-center min-h-[200px]">
                        <span className="text-red-500">오류 발생</span>
                      </div>
                    ) : (
                      <div className="w-full h-full ">
                        <p className="mb-1">{index + 1}번 침대</p>
                        <img
                          src={query.data} // /api/stream/{cctvId} URL
                          alt={`CCTV ${index + 1}`}
                          className="w-full h-auto rounded-md"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold mb-4">최근 이벤트</h2>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>이벤트 유형</TableHead>
                  <TableHead>발생 시간</TableHead>
                  <TableHead>베드 ID</TableHead>
                  <TableHead>CCTV ID</TableHead>
                  <TableHead>처리 여부</TableHead>
                  <TableHead>메모</TableHead>
                  <TableHead>환자 ID</TableHead>
                  <TableHead>액션</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event._id}>
                    <TableCell>
                      <Badge variant={getEventBadgeVariant(event.event_type)}>
                        {transitionEventType(
                          getEventBadgeVariant(event.event_type)
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(event.occurred_at),
                        "yyyy년 MM월 dd일 HH:mm:ss"
                      )}
                    </TableCell>
                    <TableCell>{event.bed_id || "-"}</TableCell>
                    <TableCell>
                      {tranferBedIdToIndex(event.cctv_id) || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={event.handled ? "default" : "destructive"}
                      >
                        {event.handled ? "처리됨" : "미처리"}
                      </Badge>
                    </TableCell>
                    <TableCell>{event.note || "-"}</TableCell>
                    <TableCell>{event.patient_id || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => handleEventDetail(event._id)}
                      >
                        상세보기
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
{
  /* <Dialog open={modalVisible} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="p-4">
            <DialogTitle>
              {selectedCCTV ? `${selectedCCTV.name} 라이브 스트림` : ""}
            </DialogTitle>
            <DialogDescription>
              실시간 CCTV 스트리밍 영상입니다.
            </DialogDescription>
          </DialogHeader>

          {selectedCCTV && (
            <div className="bg-black p-2">
              <div className="mb-2 flex justify-between items-center text-white text-sm">
                <span>
                  {selectedCCTV.floor}층 {selectedCCTV.roomNumber}호
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: getStatusColor(selectedCCTV.status),
                    }}
                  />
                  <span>{getStatusText(selectedCCTV.status)}</span>
                </div>
              </div>
              <div className="w-full h-full">
                {isPending ? (
                  <div className="flex justify-center items-center min-h-full">
                    <span className="text-white w-full h-full text-center flex justify-center">
                      로딩 중...
                    </span>
                  </div>
                ) : (
                  <img src={data} alt="" className="" />
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog> */
}
