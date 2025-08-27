import { useEffect, useRef, useState } from "react";
import { Event } from "@/types";

export const useEventStream = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = "http://210.94.242.37:7420/api/v1/events/stream";
    const source = new EventSource(url, { withCredentials: false });
    eventSourceRef.current = source;

    console.log("[SSE] 연결 시작:", url);

    source.onopen = () => {
      console.log("[SSE] 연결 성공");
    };

    source.onmessage = (event) => {
      try {
        const newEvent: Event = JSON.parse(event.data);
        console.log("[SSE] 새 이벤트 수신:", newEvent);

        setEvents((prev) => {
          const updated = [newEvent, ...prev];
          return updated.slice(0, 50); // 중복 검사 없이 최신 50개 유지
        });
      } catch (error) {
        console.error("[SSE] 이벤트 파싱 실패:", error, event.data);
      }
    };

    source.onerror = (err) => {
      console.error("[SSE] 연결 오류:", err);
      source.close();
    };

    return () => {
      console.log("[SSE] 연결 종료");
      source.close();
    };
  }, []);

  const clearEvents = () => {
    console.log("[SSE] 이벤트 리스트 초기화");
    setEvents([]);
  };

  return {
    events,
    clearEvents,
  };
};



// "6853abdea8c3d423cecc84da",
// "68639825d1f07bb25c82dee7",
// "6863982ed1f07bb25c82dee8",
// "68639835d1f07bb25c82dee9",

// "id": 환자1

// [
//     {
//       "_id": "6870e80afd301615327cdb4d",
//       "bed_id": "686b71865604c6f0fde56b24",
//       "cctv_id": "6853abdea8c3d423cecc84da",
//     },
//     {
//       "_id": "6870e815ae6b92ef674d9020",
//       "bed_id": "686b71865604c6f0fde56b25",
//       "cctv_id": "6853abdea8c3d423cecc84da",
//     },


//     {
//       "_id": "6870e81dcfce7950b565dd99",
//       "bed_id": "686b7193592328e4e9341948",
//       "cctv_id": "68639825d1f07bb25c82dee7",
//     },
//     {
//       "_id": "6870e824fd301615327cdb4e",
//       "bed_id": "686b7193592328e4e9341949",
//       "cctv_id": "68639825d1f07bb25c82dee7",
//     },
//     {
//       "_id": "6870e82afd301615327cdb4f",
//       "bed_id": "686b719d592328e4e934194a",
//       "cctv_id": "6863982ed1f07bb25c82dee8",
//     },
//     {
//       "_id": "6870e831cfce7950b565dd9a",
//       "bed_id": "686b719d592328e4e934194b",
//       "cctv_id": "6863982ed1f07bb25c82dee8",
//     },
//     {
//       "_id": "6870e837ae6b92ef674d9021",
//       "bed_id": "686b71a698efe5b5af48f741",
//       "cctv_id": "68639835d1f07bb25c82dee9",
//     },
//     {
//       "_id": "6870e83cae6b92ef674d9022",
//       "bed_id": "686b71a698efe5b5af48f742",
//       "cctv_id": "68639835d1f07bb25c82dee9",
//     }
//   ]