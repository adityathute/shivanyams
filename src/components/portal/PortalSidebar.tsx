import {
  HomeIcon,
  GovernmentJobIcon,
  GovernmentSchemeIcon,
  ResultIcon,
  AdmitCardIcon,
  GuideIcon,
  SettingsIcon,
  VideoIcon,
  MailIcon,
} from "shivanya-ui";

export const portalNavigation = [
  { label: "मुख्यपृष्ठ", href: "/", icon: <HomeIcon /> },
  { label: "सरकारी नोकरी", href: "/jobs", icon: <GovernmentJobIcon /> },
  { label: "शासकीय योजना", href: "/schemes", icon: <GovernmentSchemeIcon /> },
  { label: "निकाल", href: "/results", icon: <ResultIcon /> },
  { label: "प्रवेशपत्र", href: "/admit-cards", icon: <AdmitCardIcon /> },
  { label: "लेख आणि मार्गदर्शक", href: "/guides", icon: <GuideIcon /> },
  { label: "व्हिडिओ", href: "/videos", icon: <VideoIcon /> },
  {
    divider: true,
  },
  { label: "संपर्क", href: "/#contact", icon: <MailIcon /> },
  { label: "सेटिंग्ज", href: "/#settings", icon: <SettingsIcon /> },
];
