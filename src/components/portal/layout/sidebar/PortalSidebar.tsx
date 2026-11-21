import {
  HomeIcon,
  GovernmentJobIcon,
  GovernmentSchemeIcon,
  ExaminationIcon,
  ResultIcon,
  AdmitCardIcon,
  GuideIcon,
  VideoIcon,
  MailIcon,
  ShieldCheckIcon,
  ToolsIcon,
} from "shivanya-ui";

import { translate, type Language } from "shivanya-i18n";
import { sidebarTranslations } from "@/i18n/dictionaries/sidebar";

function SavedBookmarkIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 4.75A1.75 1.75 0 0 1 7.75 3h8.5A1.75 1.75 0 0 1 18 4.75V21l-6-3.8L6 21V4.75Z" />
    </svg>
  );
}

type PortalUser = {
  roles?: string[];
} | null;

export function getPortalNavigation(
  language: Language,
  user: PortalUser = null,
) {
  const isAdmin = user?.roles?.includes("admin") === true;

  return [
    {
      label: translate(language, sidebarTranslations, "home"),
      href: "/",
      icon: <HomeIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "jobs"),
      href: "/jobs",
      icon: <GovernmentJobIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "schemes"),
      href: "/schemes",
      icon: <GovernmentSchemeIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "guides"),
      href: "/guides",
      icon: <GuideIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "admitCards"),
      href: "/admit-cards",
      icon: <AdmitCardIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "examination"),
      href: "/examination",
      icon: <ExaminationIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "results"),
      href: "/results",
      icon: <ResultIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "videos"),
      href: "/videos",
      icon: <VideoIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "tools"),
      href: "/tools",
      icon: <ToolsIcon />,
    },
    { label: "", divider: true },
    ...(user
      ? [
          {
            label: translate(language, sidebarTranslations, "saved"),
            href: "/saved",
            icon: <SavedBookmarkIcon />,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            label: "Admin",
            href: "/admin",
            icon: <ShieldCheckIcon />,
          },
        ]
      : []),
    {
      label: translate(language, sidebarTranslations, "contact"),
      href: "/contact",
      icon: <MailIcon />,
    },
  ];
}
