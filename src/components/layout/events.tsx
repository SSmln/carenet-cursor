import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import Cookies from "js-cookie";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { Event } from "@/types"; // 이곳에서 Event 인터페이스를 가져옵니다.

import { useDashboardStore } from "@/store/dashboard";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import { Button } from "../ui/button";
// import { format } from "date-fns";
// import { Event } from "@/types"; // 이곳에서 Event 인터페이스를 가져옵니다.
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import { Button } from "../ui/button";
// import { format } from "date-fns";
// import { Event } from "@/types"; // 이곳에서 Event 인터페이스를 가져옵니다.

interface AuthMeParams {
  accessToken: string;
}

const getEvents = async ({
  accessToken,
}: AuthMeParams): Promise<Event[] | null> => {
  if (!accessToken) {
    console.error("Access token is missing");
    return null;
  }
  const apiUrl =
    `${process.env.NEXT_PUBLIC_API_URL}` + `/api/v1/events/?skip=0&limit=100`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`, // accessToken 사용
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch events");
  }
  const data = await response.json();
  return data;
};

export const Events = () => {
  const userCookie = Cookies.get("access_token");
  const { stats, events, setStats, setEvents } = useDashboardStore();

  const { data, isPending, isError } = useQuery<Event[] | null>({
    queryKey: ["Events"],
    queryFn: async () => {
      const apiUrl =
        `${process.env.NEXT_PUBLIC_API_URL}` +
        `/api/v1/events/?skip=0&limit=100`;

      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userCookie}`, // accessToken 사용
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      setEvents(data);
      return data;
      //   return data;
    },
    refetchInterval: 10000, // 10초마다 데이터 새로고침 (밀리초 단위)
    refetchIntervalInBackground: true, // 브라우저 탭이 백그라운드에 있을 때도 새로고침 유지
  });

  const unhandledEventsCount =
    data?.filter((event: Event) => !event.handled).length || 0;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="relative cursor-pointer">
          <IoNotificationsOutline className="h-7 w-7  text-muted-foreground hover:text-primary" />
          {unhandledEventsCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center  rounded-full bg-destructive  text-xs font-medium text-white ">
              {unhandledEventsCount}
            </span>
          )}
        </Button>

        {/* <IoNotificationsOutline className="h-6 w-6 text-muted-foreground hover:text-primary" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-medium text-white">
                5
              </span> */}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <h4 className="font-medium leading-none">알림</h4>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {isPending && <div className="p-4 text-center">불러오는 중...</div>}
          {isError && (
            <div className="p-4 text-center text-destructive">
              알림을 불러오는 데 실패했습니다.
            </div>
          )}
          {data === null && !isPending && !isError && (
            <div className="p-4 text-center text-muted-foreground">
              로그인이 필요합니다.
            </div>
          )}
          {data && data.length === 0 && (
            <div className="p-4 text-center text-muted-foreground">
              새로운 알림이 없습니다.
            </div>
          )}
          {data && data.length > 0 && (
            <ul className="cursor-pointer">
              {data.map((event: Event) => (
                <li
                  key={event._id}
                  className="group p-4 border-b last:border-b-0 hover:bg-white hover:text-black rounded-md"
                >
                  <p className="text-sm font-medium group-hover:text-black">
                    {event.event_type} 이벤트 발생
                  </p>
                  <p className="text-xs text-muted-foreground group-hover:text-black">
                    {format(
                      new Date(event.occurred_at), // 변경 없음
                      "yyyy년 MM월 dd일 HH:mm:ss"
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground group-hover:text-black">
                    베드 ID: {event.bed_id}
                  </p>
                  <p className="text-xs text-muted-foreground group-hover:text-black">
                    CCTV ID: {event.cctv_id}
                  </p>
                  <p className="text-xs text-muted-foreground group-hover:text-black">
                    처리됨: {event.handled ? "예" : "아니오"}
                  </p>
                  {/* 추가 정보가 있다면 여기에 표시 */}
                  {event.note && (
                    <p className="text-xs text-muted-foreground group-hover:text-black">
                      메모: {event.note}
                    </p>
                  )}
                  {event.patient_id && (
                    <p className="text-xs text-muted-foreground group-hover:text-black">
                      환자 ID: {event.patient_id}
                    </p>
                  )}
                  {/* 클립 URL이나 스크린샷 URL 등도 필요하다면 여기에 추가 */}
                  {/* {event.clip_url && (
                    <p className="text-xs text-muted-foreground group-hover:text-black">
                      <a href={event.clip_url} target="_blank" rel="noopener noreferrer">클립 보기</a>
                    </p>
                  )} */}
                  {/* {event.screenshot_url && (
                    <p className="text-xs text-muted-foreground group-hover:text-black">
                      <a href={event.screenshot_url} target="_blank" rel="noopener noreferrer">스크린샷 보기</a>
                    </p>
                  )} */}
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
