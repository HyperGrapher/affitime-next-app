import { ImageResponse } from "next/og";

export const alt = "Affitime — Markalar satar, partnerler kazanır";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg,#1a1535,#5b3df5)", color: "white" }}>
        <div style={{ fontSize: 34, fontWeight: 800, opacity: 0.9 }}>Affitime</div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, marginTop: 24 }}>Markalar satar.</div>
        <div style={{ fontSize: 96, fontWeight: 800, lineHeight: 1.02, letterSpacing: -3, color: "#ff9a74" }}>Partnerler kazanır.</div>
        <div style={{ fontSize: 30, marginTop: 36, opacity: 0.8 }}>Affiliate pazaryeri · takip · raporlama · komisyon ödemeleri</div>
      </div>
    ),
    size,
  );
}
