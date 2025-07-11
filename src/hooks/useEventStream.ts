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
