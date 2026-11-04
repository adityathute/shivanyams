import {
  HomeIcon,
  GovernmentJobIcon,
  GovernmentSchemeIcon,
  ResultIcon,
  AdmitCardIcon,
  GuideIcon,
  VideoIcon,
  MailIcon,
} from "shivanya-ui";

import { translate, type Language } from "shivanya-i18n";

export function getPortalNavigation(language: Language) {
  return [
    {
      label: translate(language, "home"),
      href: "/",
      icon: <HomeIcon />,
    },
    {
      label: translate(language, "governmentJobs"),
      href: "/jobs",
      icon: <GovernmentJobIcon />,
    },
    {
      label: translate(language, "governmentSchemes"),
      href: "/schemes",
      icon: <GovernmentSchemeIcon />,
    },
    {
      label: translate(language, "results"),
      href: "/results",
      icon: <ResultIcon />,
    },
    {
      label: translate(language, "admitCards"),
      href: "/admit-cards",
      icon: <AdmitCardIcon />,
    },
    {
      label: translate(language, "guides"),
      href: "/guides",
      icon: <GuideIcon />,
    },
    {
      label: translate(language, "videos"),
      href: "/videos",
      icon: <VideoIcon />,
    },
    {
      label: translate(language, "contact"),
      href: "/contact",
      icon: <MailIcon />,
    },
  ];
}