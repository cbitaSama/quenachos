import { ImageResponse } from "next/og";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "radial-gradient(120% 90% at 80% 20%, #FF4444 0%, #F11C1F 50%, #C81014 100%)",
          color: "#FAF7F2",
          fontFamily: "Inter, system-ui, sans-serif",
          padding: "72px",
          position: "relative",
        }}
      >
        {/* decorative circle */}
        <div
          style={{
            position: "absolute",
            top: -180,
            right: -180,
            width: 600,
            height: 600,
            borderRadius: 9999,
            background: "rgba(250, 247, 242, 0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -120,
            left: -120,
            width: 360,
            height: 360,
            borderRadius: 9999,
            background: "rgba(10, 10, 10, 0.18)",
          }}
        />

        {/* brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontWeight: 800,
            fontSize: 28,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 9999,
              background: "#FAF7F2",
              color: "#F11C1F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            QN
          </div>
          <span>QUE NACHOS</span>
        </div>

        {/* big tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            gap: 22,
          }}
        >
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            Disfruta
          </div>
          <div
            style={{
              fontSize: 120,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            sin culpa.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginTop: 18,
              fontSize: 28,
              fontWeight: 600,
              opacity: 0.95,
            }}
          >
            <span
              style={{
                background: "#0A0A0A",
                color: "#A3E635",
                padding: "10px 22px",
                borderRadius: 9999,
                fontWeight: 800,
              }}
            >
              46g PROTEÍNA
            </span>
            <span style={{ opacity: 0.7 }}>·</span>
            <span>3 sabores</span>
            <span style={{ opacity: 0.7 }}>·</span>
            <span>Hecho en Bolivia 🇧🇴</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
