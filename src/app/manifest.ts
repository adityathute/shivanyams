import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ShivanyaMS",
    short_name: "ShivanyaMS",
    description:
      "Government jobs, schemes, exam notifications, results and useful public-service updates.",
    start_url: "/",
    display: "standalone",
    background_color: "#10233f",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
