import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#050507", color: site.accent, fontSize: 22, fontWeight: 700, borderRadius: 7 }}>
        V
      </div>
    ),
    size,
  );
}
