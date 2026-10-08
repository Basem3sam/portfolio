import { ImageResponse } from "next/og";

export const alt = "Basem Esam — Backend Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const metrics = [
  { value: "100+", label: "endpoints in production" },
  { value: "200+", label: "members served" },
  { value: "7", label: "security layers" },
];

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f9f7f2",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 9999,
              backgroundColor: "#166534",
              display: "flex",
            }}
          />
          <div style={{ display: "flex", fontSize: 26, color: "#6a6252", letterSpacing: 4 }}>
            OPERATIONAL
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#6a6252" }}>— open to work</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 88,
              fontWeight: 700,
              color: "#201b12",
              letterSpacing: -3,
            }}
          >
            Basem Esam
          </div>
          <div style={{ display: "flex", fontSize: 36, color: "#a34809", marginTop: 12 }}>
            Backend Engineer — Node.js · Express · MongoDB
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {metrics.map((metric) => (
            <div
              key={metric.label}
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "22px 30px",
                borderRadius: 16,
                border: "2px solid #e4dfd3",
                backgroundColor: "#ffffff",
              }}
            >
              <div style={{ display: "flex", fontSize: 46, fontWeight: 700, color: "#a34809" }}>
                {metric.value}
              </div>
              <div style={{ display: "flex", fontSize: 22, color: "#5a5244", marginTop: 6 }}>
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <div
              style={{
                display: "flex",
                flex: 4,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#a34809",
              }}
            />
            <div
              style={{
                display: "flex",
                flex: 1,
                height: 6,
                borderRadius: 3,
                backgroundColor: "#0c6a84",
              }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", fontSize: 26, color: "#5a5244" }}>
              basemesam.vercel.app
            </div>
            <div style={{ display: "flex", fontSize: 26, color: "#6a6252" }}>
              class of 2027 · Suez Canal University
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}