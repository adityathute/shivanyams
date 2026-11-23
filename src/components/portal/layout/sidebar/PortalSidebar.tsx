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
  BookmarkIcon,
  TagIcon,
} from "shivanya-ui";

import { translate, type Language } from "shivanya-i18n";
import { sidebarTranslations } from "@/i18n/dictionaries/sidebar";

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
            icon: <BookmarkIcon size={19} />,
          },
        ]
      : []),
    {
      label: "Tags",
      href: "/tags",
      icon: <TagIcon />,
    },
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
