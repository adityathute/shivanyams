"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getPortalApiUrl } from "../../../lib/portal-api";
import { authenticatedFetch } from "../../../lib/authenticated-fetch";

export type ItemType =
  | "job"
  | "scheme"
  | "examination"
  | "result"
  | "admit"