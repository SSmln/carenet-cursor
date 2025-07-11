// 침대 영역 좌표 타입
export interface Coordinate {
  x: number;
  y: number;
}

// 사용자 관련 타입
export interface User {
  id: string;
  username: string;
  name: string;
  role: "super_admin" | "hospital_admin" | "nurse" | "operator";
  hospitalId?: string;
  email?: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
  approvedAt?: string;
  password?: string; // 목 데이터용
}

// 병원 관련 타입
export interface Hospital {
  id: string;
  name: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  licenseExpiryDate: string;
  isActive: boolean;
  bedCount: number;
  adminCount: number;
  nurseCount: number;
  createdAt: string;
}

// 이벤트 관련 타입
// export interface Event {
//   id: string;
//   type: 'fall_detected' | 'fall_predicted' | 'bedsore_detected' | 'bedsore_predicted' | 'curtain' | 'bed_empty' | 'bed_missing' | 'rail_warning';
//   roomNumber: string;
//   bedNumber: string;
//   patientName?: string;
//   timestamp: string;
//   status: 'unread' | 'read' | 'resolved';
//   severity: 'low' | 'medium' | 'high' | 'critical';
//   description?: string;
//   snapshotUrl?: string;
//   videoUrl?: string;
//   cctvId: string;
//   hospitalId: string;
//   confidence: number; // 0-100
//   metadata?: EventMetadata;
// }

export interface Event {
  _id: string;
  bed_id: string;
  cctv_id: string;
  clip_url: string | null;
  created_at: string;
  event_type: "fall" | "bedsore" | "bed_empty" | string; // dashboard에서 사용되는 type과 일치하도록 변경
  handled: boolean;
  note: string | null;
  occurred_at: string;
  patient_id: string | null;
  screenshot_url: string | null;
  updated_at: string;
  type:
    | "fall_detected"
    | "fall_predicted"
    | "bedsore_detected"
    | "bedsore_predicted"
    | "curtain"
    | "bed_empty"
    | "bed_missing"
    | "rail_warning"; // dashboard에서 사용되는 type
  severity: "low" | "medium" | "high" | "critical"; // dashboard에서 사용되는 severity
  status: "unread" | "read" | "resolved"; // 대시보드에서 사용되는 상태
}

// 이벤트 메타데이터
export interface EventMetadata {
  algorithmVersion?: string;
  processingTime?: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  [key: string]: string | number | object | undefined;
}

// CCTV 관련 타입
export interface CCTV {
  id: string;
  name: string;
  roomNumber: string;
  floor: number;
  status: "normal" | "warning" | "danger" | "offline";
  streamUrl: string;
  hospitalId: string;
  isActive: boolean;
  lastPingTime: string;
  resolution: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
}

// 침대 관련 타입
export interface Bed {
  id: string;
  roomNumber: string;
  bedNumber: string;
  floor: number;
  patientName?: string;
  isActive: boolean;
  hospitalId: string;
  cctvId: string;
  polygon: Coordinate[]; // 침대 영역 폴리곤
  lastOccupied?: string;
  status: "occupied" | "empty" | "unknown";
}

// 알림 관련 타입
export interface Alert {
  id: string;
  eventId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  recipients: string[];
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// 대시보드 통계 타입
export interface DashboardStats {
  fallDetected: number;
  fallPredicted: number;
  bedsoreDetected: number;
  bedsorePredicted: number;
  curtainAlerts: number;
  bedEmptyAlerts: number;
  totalActivePatients: number;
  activeCCTVs: number;
  offlineCCTVs: number;
  totalEvents24h: number;
  criticalEvents: number;
  resolvedEvents: number;
}

// 필터 옵션 타입
export interface FilterOptions {
  timeRange: "realtime" | "1h" | "24h" | "7d" | "custom";
  floors: number[];
  rooms: string[];
  eventTypes: Event["type"][];
  status: Event["status"][];
  severity?: Event["severity"][];
  dateRange?: [string, string];
}
