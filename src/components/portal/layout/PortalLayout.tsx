"use client";

import "./PortalShell.css";

import { type ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { DashboardShell } from "shivanya-shell";
import { AuthProvider, useAuth } from "shivanya-auth";
import type { Language } from "shivanya-i18n";

import SiteMobileFooter from "./footer/SiteMobileFooter";
import { PortalHeader } from "./header/PortalHeader";
import { getPortalNavigation } from "./sidebar/PortalSidebar";
import { PortalDataProvider } from "../data/portal-data";
import { getPortalApiUrl } from "../../../lib/portal-api";
import { authenticatedFetch, refreshAuthSession } from "../../../lib/authenticated-fetch";
import { PortalAuthProvider } from "../context/PortalAuthContext";
import {
  PortalLanguageProvider,
  usePortalLanguage,