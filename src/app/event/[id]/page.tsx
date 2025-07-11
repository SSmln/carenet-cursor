"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { format } from "date-fns";

type EventDetailResponse = {
  id: string;
  event_type: string;
  patient_id: string;
  bed_id: string;
  cctv_id: string;
  occurred_at: string;
  screenshot_url: string;
  handled: boolean;
  image_base64: string;
  content_type: string;
};

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params?.id as string;
  const userCookie = Cookies.get("access_token");

  const { data, isPending, isError } = useQuery<EventDetailResponse>({
    queryKey: ["EventDetail", eventId],
    queryFn: async () => {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/${eventId}/image`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userCookie}`,
        },
      });

      // if (!response.ok) {
      //   throw new Error("Failed to fetch event detail");
      // }
      const data = await response.json();
      console.log(data, "data");
      return data;
    },
  });

  if (isPending) {
    return (
      <DashboardLayout title="이벤트 상세">
        <div className="p-6">⏳ 이벤트 데이터를 불러오는 중...</div>
      </DashboardLayout>
    );
  }

  if (isError || !data) {
    return (
      <DashboardLayout title="이벤트 상세">
        <div className="p-6 text-red-500">
          ❌ 이벤트 데이터를 불러오는 데 실패했습니다.
        </div>
      </DashboardLayout>
    );
  }

  const imageSrc = `data:${data.content_type};base64,${data.image_base64}`;
  const formattedTime = format(
    new Date(data.occurred_at),
    "yyyy-MM-dd HH:mm:ss"
  );

  const cctvIds = [
    "6853abdea8c3d423cecc84da",
    "68639825d1f07bb25c82dee7",
    "6863982ed1f07bb25c82dee8",
    "68639835d1f07bb25c82dee9",
  ];

  const tranferBedIdToIndex = (cctvId: string) => {
    const index = cctvIds.findIndex((id) => id === cctvId);
    return index !== -1 ? `${index + 1}번` : "-";
  };

  type MappingItem = {
    _id: string; // bed_id
    bed_id: string;
    cctv_id: string;
  };

  const cctvBedMappings: MappingItem[] = [
    {
      _id: "6870e80afd301615327cdb4d",
      bed_id: "686b71865604c6f0fde56b24",
      cctv_id: "6853abdea8c3d423cecc84da",
    },
    {
      _id: "6870e815ae6b92ef674d9020",
      bed_id: "686b71865604c6f0fde56b25",
      cctv_id: "6853abdea8c3d423cecc84da",
    },
    {
      _id: "6870e81dcfce7950b565dd99",
      bed_id: "686b7193592328e4e9341948",
      cctv_id: "68639825d1f07bb25c82dee7",
    },
    {
      _id: "6870e824fd301615327cdb4e",
      bed_id: "686b7193592328e4e9341949",
      cctv_id: "68639825d1f07bb25c82dee7",
    },
    {
      _id: "6870e82afd301615327cdb4f",
      bed_id: "686b719d592328e4e934194a",
      cctv_id: "6863982ed1f07bb25c82dee8",
    },
    {
      _id: "6870e831cfce7950b565dd9a",
      bed_id: "686b719d592328e4e934194b",
      cctv_id: "6863982ed1f07bb25c82dee8",
    },
    {
      _id: "6870e837ae6b92ef674d9021",
      bed_id: "686b71a698efe5b5af48f741",
      cctv_id: "68639835d1f07bb25c82dee9",
    },
    {
      _id: "6870e83cae6b92ef674d9022",
      bed_id: "686b71a698efe5b5af48f742",
      cctv_id: "68639835d1f07bb25c82dee9",
    },
  ];

  /**
   * CCTV ID + Bed ID 를 받아서 환자번호 (환자1, 환자2 등) 반환
   */
  const getPatientLabel = (cctv_id: string, bed_id: string): string => {
    const mapped = cctvBedMappings.filter((m) => m.cctv_id === cctv_id);
    const index = mapped.findIndex((m) => m.bed_id === bed_id);

    if (index === -1) return "-";
    return `환자${index + 1}`;
  };

  return (
    <DashboardLayout title="이벤트 상세">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>이벤트 이미지</CardTitle>
          </CardHeader>
          <CardContent>
            <img
              src={imageSrc}
              alt="이벤트 이미지"
              className="w-full h-auto rounded border"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>이벤트 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>이벤트 유형:</strong>{" "}
              {data.event_type === "fall" ? "낙상" : ""}
            </div>
            <div>
              <strong>발생 시각:</strong> {formattedTime}
            </div>
            <div>
              <strong>환자 ID:</strong>{" "}
              {getPatientLabel(data.cctv_id, data.bed_id)}
            </div>

            <div>
              <strong>CCTV ID:</strong> {tranferBedIdToIndex(data.cctv_id)}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
