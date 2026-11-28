import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved posts",
  robots: { index: false, follow: false },
};

export default function PrivateSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
