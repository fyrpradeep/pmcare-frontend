import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "PMCare — Doctor Anywhere, Anytime",
  description: "Consult verified doctors online. Get prescriptions & medicines delivered.",
};
export const viewport: Viewport = {
  width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, themeColor: "#020D1A",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
        <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.19.0.js" async></script>
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
