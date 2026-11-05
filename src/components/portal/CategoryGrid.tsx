"use client";

import "./CategoryGrid.css";
import { useRouter } from "next/navigation";

import type { ReactNode } from "react";
import {
  GovernmentJobIcon,
  GovernmentSchemeIcon,
  ResultIcon,
  AdmitCardIcon,
  GuideIcon,
  VideoIcon,
} from "shivanya-ui";

import type { ItemType } from "./portal-data";

export const categories: {
  title: string;
  sub: string;
  type: ItemType;
  color: string;
  icon: ReactNode;
  href: string;
}[] = [
  {
    title: "सरकारी नोकरी",
    sub: "Latest Govt Jobs",
    type: "job",
    color: "blue",
    icon: <GovernmentJobIcon />,
    href: "/jobs",
  },
  {
    title: "शासकीय योजना",
    sub: "Govt Schemes",
    type: "scheme",
    color: "green",
    icon: <GovernmentSchemeIcon />,
    href: "/schemes",
  },
  {
    title: "निकाल",
    sub: "Results",
    type: "result",
    color: "purple",
    icon: <ResultIcon />,
    href: "/results",
  },
  {
    title: "प्रवेशपत्र",
    sub: "Admit Cards",
    type: "admit",
    color: "cyan",
    icon: <AdmitCardIcon />,
    href: "/admit-cards",
  },
  {
    title: "लेख आणि मार्गदर्शक",
    sub: "Guides & Articles",
    type: "guide",
    color: "orange",
    icon: <GuideIcon />,
    href: "/guides",
  },
  {
    title: "व्हिडिओ",
    sub: "Watch & Learn",
    type: "video",
    color: "red",
    icon: <VideoIcon />,
    href: "/videos",
  },
];

export function CategoryGrid() {
  const router = useRouter();

  return (
    <section className="category-grid">
      {categories.map((category) => (
        <button
          key={category.type}
          className={`category-card ${category.color}`}
          onClick={() => router.push(category.href)}
        >
          <span className="category-icon">{category.icon}</span>

          <span className="category-content">
            <strong>{category.title}</strong>
            <small>{category.sub}</small>
          </span>
        </button>
      ))}
    </section>
  );
}