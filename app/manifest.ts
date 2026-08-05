import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Money Tracker",
    short_name: "Money Tracker",
    description: "Quản lý tài chính cá nhân — local-first, hoạt động cả khi mất mạng.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#22C55E",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
