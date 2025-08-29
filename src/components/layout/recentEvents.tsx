"use client";

import { memo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

export const RecentEvents = memo(() => {
  const { events, clearEvents } = useEventStream();
  const router = useRouter();
  // console.log(events);
  const cctvIds = [
    "6853abdea8c3d423cecc84da",
    "68639825d1f07bb25c82dee7",
    "6863982ed1f07bb25c82dee8",
    "68639835d1f07bb25c82dee9",
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalEvents = events.length;
  const totalPages = Math.ceil(totalEvents / itemsPerPage);
  const indexOfLastEvent = currentPage * itemsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - itemsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getEventBadgeVariant = (eventType: string) => {
    switch (eventType) {
      case "fall":
        return "destructive";
      case "bedsore":
        return "warning";
      case "bed_empty":
        return "secondary";
      default:
        return "default";
    }
  };

  const transitionEventType = (eventType: string) => {
    switch (eventType) {
      case "fall":
        return "낙상 감지";
      case "bedsore":
        return "욕창 감지";
      case "bed_empty":
        return "침대 비움";
      default:
        return eventType;
    }
  };

  const tranferBedIdToIndex = (cctvId: string) => {
    const index = cctvIds.findIndex((id) => id === cctvId);
    return index !== -1 ? `${index + 1}번` : "-";
  };

  const handleEventDetail = (eventId: string) => {
    router.push(`/event/${eventId}`);
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between mb-4 pb-2 border-b-2 border-gray-200">
        <h2 className="text-xl font-semibold">최근 이벤트</h2>
        <Button variant="outline" size="sm" onClick={clearEvents}>
          지우기
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이벤트 유형</TableHead>
              <TableHead>발생 시간</TableHead>
              <TableHead>CCTV 번호</TableHead>
              <TableHead>환자</TableHead>
              {/* <TableHead>액션</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentEvents.map((event, index) => (
              <TableRow key={event._id || `event-${index}`}>
                <TableCell>
                  <Badge variant={getEventBadgeVariant(event.event_type)}>
                    {transitionEventType(event.event_type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(
                    new Date(event.occurred_at),
                    "yyyy년 MM월 dd일 HH:mm:ss"
                  )}
                </TableCell>
                <TableCell>
                  {tranferBedIdToIndex(event.cctv_id) || "-"}
                </TableCell>
                <TableCell>
                  {getPatientLabel(event.cctv_id, event.bed_id)}
                </TableCell>
                {/* <TableCell>
                  <Button
                    variant="link"
                    className="p-0 h-auto cursor-pointer"
                    onClick={() => handleEventDetail(event.id)}
                  >
                    상세보기
                  </Button>
                </TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  isActive={currentPage > 1}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    isActive={index + 1 === currentPage}
                    onClick={() => paginate(index + 1)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  isActive={currentPage < totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </CardContent>
    </Card>
  );
});
