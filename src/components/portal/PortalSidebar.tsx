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
} from "shivanya-ui";

import { translate, type Language } from "shivanya-i18n";
import { sidebarTranslations } from "@/i18n/dictionaries/sidebar";

export function getPortalNavigation(language: Language) {
  return [
    {
      label: translate(language, sidebarTranslations, "home"),
      href: "/",
      icon: <HomeIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "governmentJobs"),
      href: "/jobs",
      icon: <GovernmentJobIcon />,
    },
    {
      label: translate(language, sidebarTranslations, "governmentSchemes"),
      href: "/schemes",
      icon: <GovernmentSchemeIcon />,
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
      label: translate(language, sidebarTranslations, "admitCards"),
      href: "/admit-cards",
      icon: <AdmitCardIcon />,
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
    { label: "", divider: true },
    {
      label: translate(language, sidebarTranslations, "contact"),
      href: "/contact",
      icon: <MailIcon />,
    },
  ];
}
