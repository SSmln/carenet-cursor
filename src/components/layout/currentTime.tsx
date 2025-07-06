"use client";

import React from "react";
import { IoTimeOutline } from "react-icons/io5";
import { useCurrentTime } from "./useCurrentTime";

export const CurrentTime = React.memo(() => {
  const currentTime = useCurrentTime();

  return (
    <div className="hidden sm:flex items-center text-muted-foreground text-sm">
      <IoTimeOutline className="mr-1.5 h-4 w-4" />
      {currentTime.toLocaleString("ko-KR")}
    </div>
  );
});

CurrentTime.displayName = "CurrentTime";
