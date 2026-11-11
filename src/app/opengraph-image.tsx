import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.product.name} – ${site.slogan}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "white",
          background: `radial-gradient(70% 90% at 70% 85%, ${site.accent}55, #050507 70%)`,
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 12, opacity: 0.85 }}>{site.brand}</div>
        {/* stylizovaný M.2 disk */}
        <div style={{ position: "absolute", right: 70, top: 150, width: 560, height: 170, borderRadius: 14, background: "linear-gradient(135deg,#3a3d47,#15161b)", border: "2px solid #4a4d57", display: "flex" }}>
          <div style={{ margin: "26px 40px", flex: 1, borderRadius: 8, background: "#1d1e25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, letterSpacing: 10, opacity: 0.9 }}>
            {site.brand}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 104, fontWeight: 200, lineHeight: 1, letterSpacing: -4, maxWidth: 900 }}>{site.slogan}</div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 32, opacity: 0.6 }}>
            {site.product.name} · {site.product.readSpeed.toLocaleString("cs-CZ")} MB/s · {site.product.interfaceLabel}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
