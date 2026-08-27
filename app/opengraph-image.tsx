import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = "Без Осколков — защитная противоосколочная плёнка для окон";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
          padding: "72px 82px",
          background: "#131512",
          color: "#ffffff",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: "-120px",
            bottom: "-220px",
            display: "flex",
            width: "620px",
            height: "620px",
            border: "2px solid rgba(242, 211, 12, 0.24)",
            borderRadius: "50%",
            boxShadow: "0 0 0 90px rgba(242, 211, 12, 0.04), 0 0 0 180px rgba(242, 211, 12, 0.025)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          <div
            style={{
              display: "flex",
              width: "58px",
              height: "58px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: "#f2d30c",
              color: "#131512",
              fontSize: "26px",
              fontWeight: 800,
            }}
          >
            БО
          </div>
          <div style={{ display: "flex", fontSize: "28px", fontWeight: 800, letterSpacing: "0.12em" }}>
            {SITE_NAME.toUpperCase()}
          </div>
        </div>

        <div style={{ display: "flex", maxWidth: "940px", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#f2d30c", fontSize: "22px", fontWeight: 700, letterSpacing: "0.12em" }}>
            ЗАЩИТА ОСТЕКЛЕНИЯ
          </div>
          <div style={{ display: "flex", marginTop: "22px", fontSize: "68px", fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.045em" }}>
            Защитная противоосколочная плёнка для окон
          </div>
        </div>
      </div>
    ),
    size,
  );
}
