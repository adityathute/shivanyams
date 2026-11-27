/*
 * File Location: shivanyams/src/components/portal/layout/sidebar/PortalSidebar.tsx
 * Reference Repositories:
 *   shivanya-sdk v1.0.0 (branch sdk-v2)
 *   shivanya-auth v1.0.0 (branch auth-v2)
 *
 * Repository Commit: a3e802f7ba90b45a1d57fd180d9672e768de93fd
 * Both repositories are read-only references.
 * Cleanup Status: Clean
 * Cleanup Info: Audited navigation destinations, admin-only entries, authenticated saved-post visibility, translations and SDK icon reuse; extracted the navigation item shape for a stable documented return contract. No local CSS in this module.
 */
// Reference Repositories: shivanya-sdk v1.0.0 (Master; all navigation icons and i18n translation utilities reused); shivanya-auth (private, version not verified)

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
  ReportIcon,
} from "shivanya-ui";

import { translate, type Language } from "shivanya-i18n";
import { sidebarTranslations } from "@/i18n/organized/dictionaries/sidebar";

type PortalUser = {
  roles?: string[];
} | null;

type PortalNavigationItem = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  divider?: boolean;
};

export function getPortalNavigation(
  language: Language,
  user: PortalUser = null,
): PortalNavigationItem[] {
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
      label: translate(language, sidebarTranslations, "exams"),
      href: "/examination",
      icon: <ExaminationIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "admitCards"),
      href: "/admit-cards",
      icon: <AdmitCardIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "results"),
      href: "/results",
      icon: <ResultIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "guides"),
      href: "/guides",
      icon: <GuideIcon />,
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
      label: translate(language, sidebarTranslations, "tags"),
      href: "/tags",
      icon: <TagIcon />,
    },
    ...(isAdmin
      ? [
          {
            label: translate(language, sidebarTranslations, "admin"),
            href: "/admin",
            icon: <ShieldCheckIcon />,
          },
          {
            label: "Ledger",
            href: "/ledger",
            icon: <ReportIcon />,
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
