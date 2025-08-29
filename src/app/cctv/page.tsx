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
import { useQueries, useQuery } from "@tanstack/react-query";
import { RecentEvents } from "@/components/layout/recentEvents";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Cookies from "js-cookie";

export default function CCTVPage() {
  const [gridType, setGridType] = useState("grid-4");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCCTV, setSelectedCCTV] = useState<{
    id: string;
    streamUrl: string;
  } | null>(null);
  const [cctvIds, setCctvIds] = useState<string[]>([]);
  // console.log(cctvIds, "cctvIds");

  const userCookie = Cookies.get("access_token");
  const {
    data: cctvInfoList,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["cctvInfoList"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cctvs/?skip=0&limit=100`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userCookie}`, // accessToken 사용
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch cctv info list");
      }
      const data = await response.json();
      setCctvIds(data.map((cctv: any) => cctv._id));
      return data;
    },
  });

  const cctvQueries = useQueries({
    queries: cctvIds.map((id) => ({
      queryKey: ["cctvStream", id],
      queryFn: async () => `/api/v1/stream/${id}`, // Next.js API 라우트 URL 반환
      staleTime: Infinity, // 스트림 URL은 변하지 않으므로 무한대로 설정
      gcTime: Infinity,
    })),
  });

  const openCCTVModal = (id: string, streamUrl: string) => {
    setSelectedCCTV({ id, streamUrl });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCCTV(null);
  };

  // Removed getStatusColor and getStatusText - if needed, they should be implemented elsewhere or from live data

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

  const tranferBedIdToIndex = (cctvId: string) => {
    const index = cctvIds.findIndex((id) => id === cctvId);
    return index !== -1 ? `${index + 1}번 CCTV` : "-";
  };

  return (
    <DashboardLayout title="CCTV 뷰">
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="flex-grow">
          <Card className="h-full flex flex-col">
            <div className="p-4 flex-grow">
              <h2 className="text-xl font-semibold mb-4">병실 CCTV 뷰</h2>
              <div className="mb-4">
                <div className="flex flex-wrap gap-4">
                  <Select defaultValue="__all__">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="모든 층" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">모든 층</SelectItem>
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

                  <Select defaultValue="__all__">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="모든 상태" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">모든 상태</SelectItem>
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
                    onClick={() => {
                      // Directly use cctvId and query.data (streamUrl) without MOCK_CCTVS
                      if (query.data) {
                        openCCTVModal(cctvIds[index], query.data);
                      } else {
                        console.warn(
                          `No stream data for CCTV ID: ${cctvIds[index]}`
                        );
                      }
                    }}
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
                          <p className="mb-1">{index + 1}번 CCTV</p>
                          <img
                            src={query.data} // /api/stream/{cctvId} URL
                            alt={`CCTV ${index + 1}`}
                            className="w-full h-[200px] flex items-center rounded-md "
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
      <Dialog open={modalVisible} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="p-4">
            <DialogTitle>
              {selectedCCTV ? `CCTV ID: ${selectedCCTV.id} 라이브 스트림` : ""}
            </DialogTitle>
            <DialogDescription>
              실시간 CCTV 스트리밍 영상입니다.
            </DialogDescription>
          </DialogHeader>

          {selectedCCTV && (
            <div className="bg-black p-2">
              <div className="mb-2 flex justify-between items-center text-white text-sm">
                <span>CCTV ID: {tranferBedIdToIndex(selectedCCTV.id)}</span>
              </div>
              <div className="w-full h-full">
                <img
                  src={selectedCCTV.streamUrl}
                  alt={`CCTV ${selectedCCTV.id}`}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <RecentEvents />
    </DashboardLayout>
  );
}
