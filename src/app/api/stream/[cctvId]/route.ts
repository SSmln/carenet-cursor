// src/app/api/stream/[cctvId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { cctvId: string } }
) {
  const { cctvId } = await params;
  const accessToken = (await cookies()).get("access_token")?.value || "";
  console.log("accessToken", accessToken);
  if (!accessToken) {
    console.error("No access token found for stream.");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const streamApiUrl = `http://210.94.242.37:7420/api/v1/stream/${cctvId}`;
  console.log(`Proxying request to: ${streamApiUrl}`);

  try {
    const response = await fetch(streamApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log(`Backend stream response status: ${response.status}`);
    console.log(
      `Backend stream response Content-Type: ${response.headers.get("Content-Type")}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend stream error: ${response.status} - ${errorText}`);
      return new NextResponse(errorText || response.statusText, {
        status: response.status,
      });
    }

    return new NextResponse(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "video/mp4",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error proxying CCTV stream:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
