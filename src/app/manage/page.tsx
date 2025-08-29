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
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
// import { InfoTable } from "@/components/layout/recentEvents";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Bed } from "@/types";

interface DetectedBed extends Bed {
  _id: string; // 추가
  bed_id: string;
  patient_name: string;
}

const cctvIds = [
  "6853abdea8c3d423cecc84da",
  "68639825d1f07bb25c82dee7",
  "6863982ed1f07bb25c82dee8",
  "68639835d1f07bb25c82dee9",
];

export default function ManagePage() {
  const userCookie = Cookies.get("access_token");

  const [gridType, setGridType] = useState("grid-4");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCCTV, setSelectedCCTV] = useState<{
    id: string;
    streamUrl: string;
  } | null>(null);

  const openCCTVModal = (id: string, streamUrl: string) => {
    setSelectedCCTV({ id, streamUrl });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCCTV(null);
  };

  const cctvQueries = useQueries({
    queries: cctvIds.map((id) => ({
      queryKey: ["cctvStream", id],
      queryFn: async () => `/api/stream/${id}`, // Next.js API 라우트 URL 반환
      staleTime: Infinity, // 스트림 URL은 변하지 않으므로 무한대로 설정
      gcTime: Infinity,
    })),
  });

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
// import { Form, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

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
  const [bedEmbeddingId, setBedEmbeddingId] = useState("");
  const [patientNames, setPatientNames] = useState<Map<string, string>>(
    new Map()
  );
  console.log(patientNames, "patientNames");
  const [bedEmbeddingModalVisible, setBedEmbeddingModalVisible] =
    useState(false);

  const tranferBedIdToIndex = (cctvId: string) => {
    const index = cctvIds.findIndex((id) => id === cctvId);
    return index !== -1 ? `${index + 1}번 CCTV` : "-";
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCCTV(null);
  };

  const [name, setName] = useState("");
  const [rtspUrl, setRtspUrl] = useState("");
  const queryClient = useQueryClient();
  const [patientName, setPatientName] = useState("");

  const { mutate: addCamera } = useMutation({
    mutationKey: ["addCamera"],
    mutationFn: async () => {
      const bodyData = {
        name: name,
        rtsp_url: rtspUrl,
      };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cctvs`,
        {
          method: "POST",
          body: JSON.stringify(bodyData),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userCookie}`, // accessToken 사용
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to add camera");
      }
      const data = await response.json();
      console.log(data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cctvInfoList"] });
      console.log("Camera added successfully");
      setModalVisible(false);
      setName("");
      setRtspUrl("");
    },
    onError: (error) => {
      console.error("Failed to add camera:", error);
    },
  });

  const handleAddCameraModal = () => {
    setModalVisible(true);
    // setSelectedCCTV(null);
    console.log("add camera");
  };

  const handleAddCamera = () => {
    if (!name || !rtspUrl) {
      alert("이름과 주소를 입력해주세요.");
      return;
    }
    addCamera();
    // muate
  };

  const handleBedEmbeddingModal = (eventId: string) => {
    setBedEmbeddingModalVisible(true);
    // bedEmbedding(eventId);
    // setSelectedCCTV({ id: eventId, streamUrl: "" });
    setBedEmbeddingId(eventId);
    console.log("bed embedding");
  };

  const handleBedEmbeddingModalClose = () => {
    setBedEmbeddingModalVisible(false);
    console.log("bed embedding");
  };

  const { mutate: deleteList } = useMutation({
    mutationKey: ["deleteList"],
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cctvs/${id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userCookie}`, // accessToken 사용
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to delete camera");
      }
      const data = await response.json();
      console.log(data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cctvInfoList"] });
      console.log("Camera deleted successfully");
    },
    onError: (error) => {
      console.error("Failed to delete camera:", error);
    },
  });

  const handleDeleteCamera = (id: string) => {
    console.log("delete camera", id);
    deleteList(id);
  };

  const {
    data: bedEmbeddingData,
    isPending: bedEmbeddingPending,
    mutate: bedEmbedding,
  } = useMutation({
    mutationKey: ["bedEmbedding"],
    mutationFn: async (id: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/beds/${id}/auto`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userCookie}`, // accessToken 사용
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to bed embedding");
      }
      const data = await response.json();
      console.log(data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Bed embedding successful:", data);
      const initialPatientNames = new Map<string, string>();
      data.detected_beds.forEach((bed: any) => {
        initialPatientNames.set(bed.bed_id, bed.patient_name || "");
      });
      setPatientNames(initialPatientNames);
    },
    onError: (error) => {
      console.error("Failed to bed embedding:", error);
    },
  });

  //   68639835d1f07bb25c82dee9	cctv4	rtsp://mediamtx_rtsp_server:8554/cctv4

  const { mutate: assignPatient } = useMutation({
    mutationKey: ["assignPatient"],
    mutationFn: async (paitent: { bed_id: string; patient_name: string }) => {
      //   console.log(bodyData, "bodyData");
      const bedId = paitent.bed_id;
      const patientName = paitent.patient_name || "";

      // const bodyData = {
      //   patient_name: patientName,
      // };

      // console.log(bodyData, "bodyData");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/beds/${bedId}/assign?patient_name=${encodeURIComponent(patientName)}`,
        {
          method: "POST",
          // body: JSON.stringify(bodyData),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userCookie}`, // accessToken 사용
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to assign patient");
      }
      const data = await response.json();
      console.log(data);
      return data;
    },
    onSuccess: () => {
      toast.success("환자 할당 성공");
      queryClient.invalidateQueries({ queryKey: ["cctvInfoList"] });
      setBedEmbeddingModalVisible(false);
      console.log("Patient assigned successfully");
    },
    onError: (error) => {
      console.error("Failed to assign patient:", error);
    },
  });

  const handlePatientAssign = () => {
    console.log(patientNames, "patientNames");
    const patientsToAssign = Array.from(patientNames.entries()).map(
      ([bed_id, patient_name]) => ({
        bed_id,
        patient_name,
      })
    );

    console.log(patientsToAssign, "patientsToAssign");

    patientsToAssign.forEach((patient) => {
      if (patient.patient_name.trim() === "") {
        alert(
          `환자명이 비어있는 침대(${patient.bed_id})는 할당할 수 없습니다.`
        );
        return;
      }
      assignPatient(patient);
    });

    setPatientNames(new Map());
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between mb-4 pb-2 border-b-2 border-gray-200">
        <h2 className="text-xl font-semibold">CCTV 모니터링</h2>
        <Button variant="default" size="sm" onClick={handleAddCameraModal}>
          + 카메라 추가
        </Button>
        <Dialog open={modalVisible} onOpenChange={handleModalClose}>
          <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden ">
            <DialogHeader className="p-4">
              <DialogTitle>카메라 추가</DialogTitle>
              <DialogDescription className="flex flex-col gap-2 w-full py-12 justify-center items-center">
                <Input
                  className="w-full max-w-[300px]"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                <Input
                  className="w-full max-w-[300px]"
                  placeholder="CCTV URL"
                  value={rtspUrl}
                  onChange={(e) => setRtspUrl(e.target.value)}
                />

                <Button
                  className="max-w-fit w-full flex justify-center items-center mt-4"
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddCamera();
                  }}
                >
                  추가
                </Button>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CCTV ID</TableHead>
              <TableHead className="text-center">호실(병실)</TableHead>
              <TableHead>IP 주소</TableHead>
              <TableHead className="text-center">환자수</TableHead>
              <TableHead className="text-center">인식침대수</TableHead>

              {/* <TableHead>수정</TableHead> */}
              <TableHead>삭제</TableHead>
              <TableHead>상세보기</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cctvInfoList?.map((event) => (
              <TableRow key={event._id}>
                <TableCell>{event._id}</TableCell>
                <TableCell className="text-center">{event.name}</TableCell>
                <TableCell>{event.rtsp_url}</TableCell>
                <TableCell className="text-center">
                  {event.patient_count}
                </TableCell>
                <TableCell className="text-center">{event.bed_count}</TableCell>
                {/* <TableCell>
                  <Button
                    variant="default"
                    className="p-1 h-auto cursor-pointer"
                  >
                    수정
                  </Button>
                </TableCell> */}
                <TableCell>
                  <Button
                    variant="default"
                    className="p-1 h-auto cursor-pointer"
                    onClick={() => handleDeleteCamera(event._id)}
                  >
                    삭제
                  </Button>
                </TableCell>

                <TableCell>
                  <Button
                    variant="default"
                    className="p-1 h-auto cursor-pointer"
                    onClick={() => handleBedEmbeddingModal(event._id)}
                    // onClick={() => handleDeleteCamera(event.id)}
                  >
                    상세보기
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog
        open={bedEmbeddingModalVisible}
        onOpenChange={handleBedEmbeddingModalClose}
      >
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="p-4">
            <DialogTitle>
              {/* {selectedCCTV ? `CCTV ID: ${selectedCCTV.id} 라이브 스트림` : ""} */}
            </DialogTitle>
            <DialogDescription>
              <Button
                variant="default"
                size="sm"
                onClick={() => bedEmbedding(bedEmbeddingId)}
              >
                침대 인식
              </Button>
            </DialogDescription>
          </DialogHeader>
          {/* {bedEmbeddingData && ( */}
          <div className="w-full h-full">
            {bedEmbeddingPending ? (
              <div className="flex justify-center bg-transparent opacity-50 h-[600px] items-center">
                <Loader2 className="w-10 h-10 animate-spin" />
              </div>
            ) : (
              bedEmbeddingData && (
                <img
                  src={`data:image/png;base64,${bedEmbeddingData.visualization_image}`}
                  alt="시각화 이미지"
                  className="mx-auto"
                />
              )
            )}

            <form
              action=""
              className="flex flex-col gap-2 w-full py-12 justify-center items-center"
            >
              {bedEmbeddingData &&
                bedEmbeddingData.detected_beds.map((bed: DetectedBed) => (
                  <div
                    key={bed._id}
                    className="flex w-full justify-center items-center gap-2"
                  >
                    <span className="w-full max-w-[300px] text-sm text-gray-500 border-1  border-gray-400 rounded-md p-2">
                      {bed.bed_id}
                    </span>
                    <Input
                      className="w-full max-w-[300px]"
                      placeholder="환자명"
                      value={patientNames.get(bed.bed_id) ?? ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const newPatientNames = new Map(patientNames);

                        newPatientNames.set(bed.bed_id, e.target.value);

                        console.log(newPatientNames);
                        setPatientNames(newPatientNames);
                      }}
                    />
                    {/* <span>{bed.patient_id}</span> */}
                  </div>
                ))}

              <Button
                className="max-w-fit w-full flex justify-center items-center mt-4"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  handlePatientAssign(patientNames);
                  //   handleAddCamera();
                }}
              >
                저장
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
});
