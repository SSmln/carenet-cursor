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
import { MOCK_CCTVS } from "@/constants/mock-data";
import { CCTV } from "@/types";
import ReactPlayer from "react-player";
import { useMutation, useQueries } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { isPageStatic } from "next/dist/build/utils";

const fetchStreamCCtvs = async (CCtvId) => {
  const apiUrl = `http://210.94.242.37:7420/api/v1/stream/jpg/${CCtvId}`;
  // const accessToken = Cookies.("access_token") || "";
  const accessToken = Cookies.get("access_token") || "";
  try {
    const response = await fetch(`${apiUrl}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`, // 토큰만 필요
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const blob = await response.blob(); // 바이너리 데이터로 받기
    const imageUrl = URL.createObjectURL(blob); // 프론트에서 쓸 수 있는 이미지 URL 생성
    console.log("CCTV 스트림 URL:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("CCTV 스트림 요청 실패:", error);
    throw new Error("CCTV 스트림 요청 실패");
  }
};

export default function CCTVPage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCCTV, setSelectedCCTV] = useState<CCTV | null>(null);
  const [gridType, setGridType] = useState("grid-4");

  const cctvIds = [
    "6853abdea8c3d423cecc84da",
    "68639825d1f07bb25c82dee7",
    "6863982ed1f07bb25c82dee8",
    "68639835d1f07bb25c82dee9",
  ];

  const cctvQueries = useQueries({
    queries: cctvIds.map((id) => ({
      queryKey: ["cctvStream", id],
      queryFn: () => fetchStreamCCtvs(id),
      staleTime: 1000 * 60, // 필요시 설정
    })),
  });

  console.log("CCTV 스트림 쿼리 결과:", cctvQueries);
  // const {
  //   data,
  //   isPending,
  //   isError,
  //   mutate: fetchStream,
  // } = useMutation({
  //   mutationKey: ["cctvs"],
  //   mutationFn: async () => {
  //     const result = await fetchStreamCCtvs();
  //     return result;
  //   },
  //   // refetchOnWindowFocus: false,
  // });
  // console.log()
  const openCCTVModal = (cctv: CCTV) => {
    // fetchStream();
    setSelectedCCTV(cctv);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCCTV(null);
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

  return (
    <DashboardLayout title="CCTV 뷰">
      <div className="mb-6">
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
                  className="cursor-pointer h-full p-0"
                >
                  <div className="p-4 border-border-gray-200 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">CCTV {index + 1}</span>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: getStatusColor("normal"), // 임시로 "normal" 상태로 설정
                          }}
                        />
                        <span className="text-xs text-gray-500">
                          {getStatusText("normal")}{" "}
                          {/* 임시로 "normal" 상태로 설정 */}
                        </span>
                      </div>
                    </div>
                    {query.isPending ? (
                      <div className="flex justify-center items-center min-h-[200px]">
                        <span className="text-gray-500">로딩 중...</span>
                      </div>
                    ) : query.isError ? (
                      <div className="flex justify-center items-center min-h-[200px]">
                        <span className="text-red-500">오류 발생</span>
                      </div>
                    ) : (
                      <div className="w-full h-full">
                        <img
                          src={query.data} // ✅ 여기서 가져옴
                          alt={`CCTV ${index + 1}`}
                          className=""
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}

              {/* {MOCK_CCTVS.map((cctv) => (
                <div key={cctv.id}>
                  <Card
                    onClick={() => openCCTVModal(cctv)}
                    className="cursor-pointer h-full p-0"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">{cctv.name}</span>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getStatusColor(cctv.status),
                            }}
                          />
                          <span className="text-xs text-gray-500">
                            {getStatusText(cctv.status)}
                          </span>
                        </div>
                      </div>
                      <div className="relative pb-[56.25%] overflow-hidden bg-gray-200 rounded-md">
                        <img />

                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          {cctv.floor}층 {cctv.roomNumber}호
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))} */}
            </div>
          </div>
        </Card>
      </div>
      <Dialog open={modalVisible} onOpenChange={handleModalClose}>
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
      </Dialog>
    </DashboardLayout>
  );
}
