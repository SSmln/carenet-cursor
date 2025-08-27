"use client";
import {
  AwaitedReactNode,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
  useState,
} from "react";
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
import { useQueries } from "@tanstack/react-query";
// import { InfoTable } from "@/components/layout/recentEvents";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ManagePage() {
  const [gridType, setGridType] = useState("grid-4");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCCTV, setSelectedCCTV] = useState<{
    id: string;
    streamUrl: string;
  } | null>(null);

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
    <DashboardLayout title="CCTV 관리">
      <div className="flex flex-col lg:flex-row gap-6 mb-6">
        <div className="flex-grow">
          <InfoTable />
        </div>
      </div>
    </DashboardLayout>
  );
}
// ("use client");

import { memo } from "react";
import { CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { useEventStream } from "@/hooks/useEventStream";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie"; // 더 이상 직접 사용하지 않으므로 제거

export const InfoTable = memo(() => {
  const userCookie = Cookies.get("access_token");
  // const accessToken = (await cookies()).get("access_token")?.value || "";

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
      console.log(data);
      return data;
    },
  });

  //   console.log(data);
  const [gridType, setGridType] = useState("grid-4");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCCTV, setSelectedCCTV] = useState<{
    id: string;
    streamUrl: string;
  } | null>(null);

  const tranferBedIdToIndex = (cctvId: string) => {
    const index = cctvIds.findIndex((id) => id === cctvId);
    return index !== -1 ? `${index + 1}번 CCTV` : "-";
  };

  const openCCTVModal = (id: string, streamUrl: string) => {
    setSelectedCCTV({ id, streamUrl });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCCTV(null);
  };
  //   const getEventBadgeVariant = (eventType: string) => {
  //     switch (eventType) {
  //       case "fall":
  //         return "destructive";
  //       case "bedsore":
  //         return "warning";
  //       case "bed_empty":
  //         return "secondary";
  //       default:
  //         return "default";
  //     }
  //   };

  //   const transitionEventType = (eventType: string) => {
  //     switch (eventType) {
  //       case "fall":
  //         return "낙상 감지";
  //       case "bedsore":
  //         return "욕창 감지";
  //       case "bed_empty":
  //         return "침대 비움";
  //       default:
  //         return eventType;
  //     }
  //   };

  //   //   const tranferBedIdToIndex = (cctvId: string) => {
  //   //     const index = cctvIds.findIndex((id) => id === cctvId);
  //   //     return index !== -1 ? `${index + 1}번` : "-";
  //   //   };

  //   //   const handleEventDetail = (eventId: string) => {
  //   //     router.push(`/event/${eventId}`);
  //   //   };

  //   type MappingItem = {
  //     _id: string; // bed_id
  //     bed_id: string;
  //     cctv_id: string;
  //   };

  //   const cctvBedMappings: MappingItem[] = [
  //     {
  //       _id: "6870e80afd301615327cdb4d",
  //       bed_id: "686b71865604c6f0fde56b24",
  //       cctv_id: "6853abdea8c3d423cecc84da",
  //     },
  //     {
  //       _id: "6870e815ae6b92ef674d9020",
  //       bed_id: "686b71865604c6f0fde56b25",
  //       cctv_id: "6853abdea8c3d423cecc84da",
  //     },
  //     {
  //       _id: "6870e81dcfce7950b565dd99",
  //       bed_id: "686b7193592328e4e9341948",
  //       cctv_id: "68639825d1f07bb25c82dee7",
  //     },
  //     {
  //       _id: "6870e824fd301615327cdb4e",
  //       bed_id: "686b7193592328e4e9341949",
  //       cctv_id: "68639825d1f07bb25c82dee7",
  //     },
  //     {
  //       _id: "6870e82afd301615327cdb4f",
  //       bed_id: "686b719d592328e4e934194a",
  //       cctv_id: "6863982ed1f07bb25c82dee8",
  //     },
  //     {
  //       _id: "6870e831cfce7950b565dd9a",
  //       bed_id: "686b719d592328e4e934194b",
  //       cctv_id: "6863982ed1f07bb25c82dee8",
  //     },
  //     {
  //       _id: "6870e837ae6b92ef674d9021",
  //       bed_id: "686b71a698efe5b5af48f741",
  //       cctv_id: "68639835d1f07bb25c82dee9",
  //     },
  //     {
  //       _id: "6870e83cae6b92ef674d9022",
  //       bed_id: "686b71a698efe5b5af48f742",
  //       cctv_id: "68639835d1f07bb25c82dee9",
  //     },
  //   ];

  //   /**
  //    * CCTV ID + Bed ID 를 받아서 환자번호 (환자1, 환자2 등) 반환
  //    */
  //   const getPatientLabel = (cctv_id: string, bed_id: string): string => {
  //     const mapped = cctvBedMappings.filter((m) => m.cctv_id === cctv_id);
  //     const index = mapped.findIndex((m) => m.bed_id === bed_id);

  //     if (index === -1) return "-";
  //     return `환자${index + 1}`;
  //   };

  const handleAddCamera = () => {
    console.log("add camera");
  };

  //   bed_count
  //   :
  //   2
  //   created_at
  //   :
  //   "2025-06-19T15:19:10.364000"
  //   name
  //   :
  //   "cctv1"
  //   patient_count
  //   :
  //   2
  //   rtsp_url
  //   :
  //   "rtsp://mediamtx_rtsp_server:8554/cctv1"
  //   updated_at
  //   :
  //   "2025-08-27T22:07:10.137816"
  //   _id
  //   :
  //   "6853abdea8c3d423cecc84da"

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between mb-4 pb-2 border-b-2 border-gray-200">
        <h2 className="text-xl font-semibold">CCTV 모니터링</h2>
        <Button variant="default" size="sm" onClick={handleAddCamera}>
          + 카메라 추가
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CCTV ID</TableHead>
              <TableHead>호실(병실)</TableHead>
              <TableHead>IP 주소</TableHead>
              <TableHead>환자수</TableHead>
              <TableHead>인식침대수</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cctvInfoList?.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event._id}</TableCell>
                <TableCell>{event.name}</TableCell>
                <TableCell>{event.rtsp_url}</TableCell>
                <TableCell>{event.patient_count}</TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto cursor-pointer"
                    // onClick={() => handleEventDetail(event.id)}
                  >
                    상세보기
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

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
    </Card>
  );
});
