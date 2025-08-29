// src/app/api/stream/[cctvId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(
  request: NextRequest,
  { params }: { params: { cctvId: string } }
) {
  const { cctvId } = params;
  const accessToken = (await cookies()).get("access_token")?.value || "";
  // console.log("accessToken", accessToken);
  if (!accessToken) {
    console.error("No access token found for stream.");
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // 1. CCTV 상세 정보를 먼저 가져옵니다.
  let cctvDetails;
  try {
    const cctvDetailResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/cctvs/${cctvId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!cctvDetailResponse.ok) {
      console.error(
        `Failed to fetch CCTV details for ${cctvId}: ${cctvDetailResponse.status} - ${await cctvDetailResponse.text()}`
      );
      return new NextResponse("CCTV not found or access denied", {
        status: cctvDetailResponse.status,
      });
    }

    cctvDetails = await cctvDetailResponse.json();
  } catch (error) {
    console.error(`Error fetching CCTV details for ${cctvId}:`, error);
    return new NextResponse("Internal Server Error during CCTV detail fetch", {
      status: 500,
    });
  }

  if (!cctvDetails || !cctvDetails.rtsp_url) {
    console.error(`RTSP URL not found for CCTV ID: ${cctvId}`);
    return new NextResponse("RTSP URL not found", { status: 404 });
  }

  // 2. 실제 스트리밍 URL을 가져온 rtsp_url로 설정합니다.
  const streamApiUrl = cctvDetails.rtsp_url;
  // console.log(`Proxying request to: ${streamApiUrl}`);

  try {
    const response = await fetch(streamApiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // console.log(`Backend stream response status: ${response.status}`);
    // console.log(
    //   `Backend stream response Content-Type: ${response.headers.get("Content-Type")}`
    // );

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
