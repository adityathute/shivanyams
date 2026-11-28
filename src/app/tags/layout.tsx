import type { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tag pages",
  robots: { index: false, follow: true },
};

export default function NonIndexableSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
