export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type EndpointAccess = "public" | "protected" | "admin";

export type EndpointId =
  | "health"
  | "login"
  | "me"
  | "tracks"
  | "popular"
  | "enroll"
  | "session"
  | "progress"
  | "submit"
  | "grade"
  | "trustedHosts"
  | "feed"
  | "liveStats"
  | "activityMe";

export type ExplorerEndpoint = {
  id: EndpointId;
  method: HttpMethod;
  path: string;
  access: EndpointAccess;
  status: number;
  latency: [number, number];
  rateLimit: number;
  response: Record<string, unknown>;
};

export const EXPLORER_ENDPOINTS: ExplorerEndpoint[] = [
  {
    id: "health",
    method: "GET",
    path: "/health",
    access: "public",
    status: 200,
    latency: [38, 90],
    rateLimit: 300,
    response: { status: "ok", uptime: 41203, database: "connected" },
  },
  {
    id: "login",
    method: "POST",
    path: "/v1/users/login",
    access: "public",
    status: 200,
    latency: [210, 460],
    rateLimit: 5,
    response: {
      status: "success",
      token: "<jwt>",
      data: { user: { name: "Basem Esam", role: "student" } },
    },
  },
  {
    id: "me",
    method: "GET",
    path: "/v1/users/me",
    access: "protected",
    status: 200,
    latency: [60, 140],
    rateLimit: 300,
    response: {
      status: "success",
      data: {
        user: { name: "Basem Esam", role: "student", emailVerified: true, pendingTrack: null },
      },
    },
  },
  {
    id: "tracks",
    method: "GET",
    path: "/v1/tracks?limit=1",
    access: "public",
    status: 200,
    latency: [140, 320],
    rateLimit: 300,
    response: {
      status: "success",
      results: 1,
      total: 12,
      pagination: { page: 1, limit: 1, totalPages: 12, hasNext: true },
      data: {
        tracks: [{ title: "Backend Fundamentals", level: "beginner", studentCount: 48 }],
      },
    },
  },
  {
    id: "popular",
    method: "GET",
    path: "/v1/tracks/popular",
    access: "public",
    status: 200,
    latency: [90, 200],
    rateLimit: 300,
    response: {
      status: "success",
      results: 2,
      data: {
        tracks: [
          { title: "Backend Fundamentals", studentCount: 48 },
          { title: "Web Foundations", studentCount: 31 },
        ],
      },
    },
  },
  {
    id: "enroll",
    method: "POST",
    path: "/v1/tracks/:id/enroll-me",
    access: "protected",
    status: 200,
    latency: [110, 260],
    rateLimit: 300,
    response: {
      status: "success",
      message: "Enrollment request submitted — awaiting track staff approval",
    },
  },
  {
    id: "session",
    method: "GET",
    path: "/v1/sessions/:id",
    access: "protected",
    status: 200,
    latency: [70, 160],
    rateLimit: 300,
    response: {
      status: "success",
      data: {
        session: {
          title: "REST API design — part 1",
          duration: 45,
          isEnrolled: true,
          myProgress: { status: "watched" },
        },
      },
    },
  },
  {
    id: "progress",
    method: "PUT",
    path: "/v1/sessions/:id/progress",
    access: "protected",
    status: 200,
    latency: [60, 130],
    rateLimit: 300,
    response: { status: "success", message: "Session marked as watched" },
  },
  {
    id: "submit",
    method: "POST",
    path: "/v1/assignments/:id/submissions",
    access: "protected",
    status: 200,
    latency: [130, 290],
    rateLimit: 300,
    response: {
      status: "success",
      data: { submittedAt: "2025-11-02T18:04:11Z", late: false },
    },
  },
  {
    id: "grade",
    method: "PATCH",
    path: "/v1/assignments/:id/submissions/:studentId/grade",
    access: "admin",
    status: 200,
    latency: [90, 210],
    rateLimit: 300,
    response: {
      status: "success",
      data: { grade: 92, feedback: "Clean separation of concerns." },
    },
  },
  {
    id: "trustedHosts",
    method: "GET",
    path: "/v1/config/trusted-hosts",
    access: "public",
    status: 200,
    latency: [25, 60],
    rateLimit: 300,
    response: {
      status: "success",
      count: 11,
      hosts: ["youtube.com", "drive.google.com", "github.com", "cloudinary.com", "… 6 more"],
    },
  },
  {
    id: "feed",
    method: "GET",
    path: "/v1/feed",
    access: "public",
    status: 200,
    latency: [80, 180],
    rateLimit: 300,
    response: {
      status: "success",
      data: {
        announcements: [{ title: "Mid-season session lineup", isPinned: true }],
        events: [{ title: "Intro to Databases", date: "2025-11-14" }],
      },
    },
  },
  {
    id: "liveStats",
    method: "GET",
    path: "/v1/dashboard-stats/live",
    access: "admin",
    status: 200,
    latency: [180, 420],
    rateLimit: 300,
    response: {
      status: "success",
      data: { stats: { users: 214, activeTracks: 6, newUsers24h: 5 } },
    },
  },
  {
    id: "activityMe",
    method: "GET",
    path: "/v1/activity-logs/me",
    access: "protected",
    status: 200,
    latency: [70, 170],
    rateLimit: 300,
    response: {
      status: "success",
      results: 2,
      data: {
        logs: [
          { action: "login", createdAt: "2025-11-02T18:02:47Z" },
          { action: "enroll_track", createdAt: "2025-11-01T09:31:02Z" },
        ],
      },
    },
  },
];