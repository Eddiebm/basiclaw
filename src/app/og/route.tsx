import { ImageResponse } from "next/og";

export const runtime = "nodejs";

const SIZE = { width: 1200, height: 630 };

type OgKind = "default" | "constitution" | "audit" | "topic" | "compare" | "questions" | "index";

function palette(kind: OgKind): { bg: string; accent: string } {
  switch (kind) {
    case "index":
      return {
        bg: "linear-gradient(135deg, #0a0a0f 0%, #1e1b4b 48%, #4338ca 100%)",
        accent: "rgba(165, 180, 252, 0.35)",
      };
    case "questions":
      return {
        bg: "linear-gradient(135deg, #0a0a0f 0%, #134e4a 42%, #0e7490 100%)",
        accent: "rgba(34, 211, 238, 0.22)",
      };
    case "audit":
      return {
        bg: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 55%, #312e81 100%)",
        accent: "rgba(196, 181, 253, 0.35)",
      };
    case "constitution":
      return {
        bg: "linear-gradient(135deg, #0c1222 0%, #134e4a 45%, #0f766e 100%)",
        accent: "rgba(45, 212, 191, 0.25)",
      };
    case "topic":
      return {
        bg: "linear-gradient(135deg, #0a0a0f 0%, #422006 50%, #92400e 100%)",
        accent: "rgba(251, 191, 36, 0.2)",
      };
    case "compare":
      return {
        bg: "linear-gradient(135deg, #0a0a0f 0%, #111827 40%, #3730a3 100%)",
        accent: "rgba(129, 140, 248, 0.3)",
      };
    default:
      return {
        bg: "linear-gradient(135deg, #0a0a0f 0%, #111827 50%, #1e3a8a 100%)",
        accent: "rgba(255,255,255,0.1)",
      };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Every country's constitution, in plain language.";
  const subtitle = searchParams.get("subtitle") ?? "BasicLaw · 195 jurisdictions · zero jargon";
  const kind = (searchParams.get("kind") ?? "default") as OgKind;
  const flagA = searchParams.get("flagA") ?? "";
  const flagB = searchParams.get("flagB") ?? "";
  const topic = searchParams.get("topic") ?? "";
  const flagSingle = searchParams.get("flag") ?? "";
  const grade = searchParams.get("grade") ?? "";
  const overall = searchParams.get("overall") ?? "";

  const { bg, accent } = palette(kind);

  if (kind === "index") {
    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px",
            background: bg,
            color: "white",
            fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                }}
              >
                ⚖️
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.5 }}>BasicLaw</div>
                <div style={{ fontSize: 17, color: "rgba(255,255,255,0.7)" }}>Legal Literacy Index</div>
              </div>
            </div>
            <div
              style={{
                minWidth: 120,
                textAlign: "center",
                borderRadius: 24,
                padding: "16px 28px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1 }}>{grade || "—"}</div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>Grade</div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: 32,
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 88,
              }}
            >
              {flagSingle || "🏳️"}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
              <div style={{ fontSize: 30, color: "rgba(255,255,255,0.82)" }}>
                Overall {overall || subtitle}
                <span style={{ fontSize: 22, color: "rgba(255,255,255,0.55)" }}> / 100</span>
              </div>
              <div style={{ fontSize: 20, color: "rgba(255,255,255,0.6)" }}>{subtitle}</div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 19,
              color: "rgba(255,255,255,0.65)",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              paddingTop: 20,
            }}
          >
            <span>basiclaw.app</span>
            <span>Educational index · not an authoritative ranking</span>
          </div>
        </div>
      ),
      { ...SIZE }
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background: bg,
          color: "white",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 16,
                background: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
              }}
            >
              ⚖️
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>BasicLaw</div>
              <div style={{ fontSize: 18, color: "rgba(255,255,255,0.65)", textTransform: "capitalize" }}>{kind}</div>
            </div>
          </div>
          {kind === "compare" && (flagA || flagB) ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 52,
                }}
              >
                {flagA || "🏳️"}
              </div>
              <div style={{ fontSize: 28, color: "rgba(255,255,255,0.55)", fontWeight: 700 }}>vs</div>
              <div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 20,
                  background: "rgba(255,255,255,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 52,
                }}
              >
                {flagB || "🏳️"}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: kind === "audit" ? 64 : 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: "92%",
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 26, color: "rgba(255,255,255,0.78)" }}>{subtitle}</div>
            {kind === "compare" && topic ? (
              <div style={{ fontSize: 22, color: "rgba(255,255,255,0.6)" }}>Topic · {topic}</div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "rgba(255,255,255,0.65)",
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: 22,
          }}
        >
          <span>basiclaw.app</span>
          <span>Free · Educational · Not legal advice</span>
        </div>
      </div>
    ),
    { ...SIZE }
  );
}
