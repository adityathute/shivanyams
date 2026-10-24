import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShivanyaMS",
  description: "ShivanyaMS application",
};

const themeScript = `
(function () {
  try {
    var savedTheme = localStorage.getItem("shivanya-theme");
    var theme;

    if (savedTheme === "dark" || savedTheme === "light") {
      theme = savedTheme;
    } else {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    document.documentElement.dataset.theme = theme;
  } catch {
    document.documentElement.dataset.theme = "light";
  }
})();
`;

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}