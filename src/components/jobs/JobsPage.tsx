"use client";

import "../portal/home/UpdatesSection.css";
import "./JobsPage.css";
import { useEffect, useMemo, useState } from "react";
import { usePortalData } from "../portal/data/portal-data";
import { createPostSlug } from "../portal/post/PortalPostDetail";
import { SearchIcon } from "shivanya-ui";
import { PortalFooter } from "../portal/layout/footer/PortalFooter";
import type { Language } from "shivanya-i18n";
import { usePortalLanguage } from "../portal/context/PortalLanguageContext";
import { baseDictionary, getBaseText } from "../../i18n/dictionaries/base";
import { JobsCharacters } from "./JobsCharacters";
import { getPortalApiUrl } from "../../lib/portal-api";

type JobDiscoveryPost = {
  id: number;
  slug: string;
  title_en?: string;
  title_mr?: string;
  title_hi?: string;
  summary_en?: string;
  summary_mr?: string;
  summary_hi?: string;
  published_at?: string | null;
  organization_type?: string;
  location?: string;
  state?: string;
  country?: string;
  organization_type?: string;
  job_details?: {
    total_vacancies?: number | null;
    recruitment_type?: string;
    application_mode?: string;
    applications_open?: boolean;
  } | null;
};

const filterOptions = {
  recruitment: [
    ["", "All recruitment types"], ["regular", "Regular"], ["contract", "Contract"],
    ["apprenticeship", "Apprenticeship"], ["temporary", "Temporary"],
    ["deputation", "Deputation"], ["other", "Other"],
  ],
  mode: [["", "Any application mode"], ["online", "Online"], ["offline", "Offline"], ["both", "Online / Offline"]],
  status: [["", "All application statuses"], ["open", "Application open"], ["upcoming", "Upcoming"], ["closed", "Closed"]],
} as const;

export function JobsPage() {
  const [query, setQuery] = useState("");
  const [recruitmentType, setRecruitmentType] = useState("");
  const [applicationMode, setApplicationMode] = useState("");
  const [applicationStatus, setApplicationStatus] = useState("");
  const [minVacancies, setMinVacancies] = useState("");
  const [maxVacancies, setMaxVacancies] = useState("");
  const [closingFrom, setClosingFrom] = useState("");
  const [closingTo, setClosingTo] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [facets, setFacets] = useState<{ organization_types: { value: string; label: string }[]; departments: string[]; designations: string[]; locations: string[]; states: string[]; countries: string[] }>({ organization_types: [], departments: [], designations: [], locations: [], states: [], countries: [] });
  const [results, setResults] = useState<JobDiscoveryPost[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { data } = usePortalData();
  const { language } = usePortalLanguage();

  const t = (key: keyof typeof baseDictionary) => getBaseText(key, language as Language);
  const locale = language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-IN";

  const legacyJobs = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data.items.filter((item) => item.type === "job" && (!term ||
      [item.title, item.category, item.description].some((value) => value.toLowerCase().includes(term))));
  }, [data.items, query]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(getPortalApiUrl("content/jobs/facets/"), { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Unable to load job filter options."); return response.json(); })
      .then((payload) => setFacets({
        organization_types: payload.organization_types || [], departments: payload.departments || [],
        designations: payload.designations || [], locations: payload.locations || [],
        states: payload.states || [], countries: payload.countries || [],
      }))
      .catch((error) => { if (error.name !== "AbortError") console.error("Job filter options failed:", error); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!hasSearched) return;
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (recruitmentType) params.set("recruitment_type", recruitmentType);
    if (applicationMode) params.set("application_mode", applicationMode);
    if (applicationStatus) params.set("application_status", applicationStatus);
    if (minVacancies) params.set("min_vacancies", minVacancies);
    if (maxVacancies) params.set("max_vacancies", maxVacancies);
    if (closingFrom) params.set("closing_from", closingFrom);
    if (closingTo) params.set("closing_to", closingTo);
    if (organizationType) params.set("organization_type", organizationType);
    if (department) params.set("department", department);
    if (designation) params.set("designation", designation);
    if (location) params.set("location", location);
    if (state) params.set("state", state);
    if (country) params.set("country", country);
    params.set("sort", "recent");

    setSearchLoading(true);
    setSearchError("");
    fetch(getPortalApiUrl(`content/jobs/discovery/?${params.toString()}`), { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.detail || "Unable to load filtered jobs.");
        }
        return response.json();
      })
      .then((payload) => setResults(Array.isArray(payload) ? payload : payload.results || []))
      .catch((error) => {
        if (error.name !== "AbortError") setSearchError(error.message || "Unable to load filtered jobs.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setSearchLoading(false);
      });
    return () => controller.abort();
  }, [hasSearched, query, recruitmentType, applicationMode, applicationStatus, minVacancies, maxVacancies, closingFrom, closingTo, organizationType, department, designation, location, state, country]);

  const displayedJobs = hasSearched ? results : legacyJobs;
  const clearFilters = () => {
    setQuery(""); setRecruitmentType(""); setApplicationMode(""); setApplicationStatus("");
    setMinVacancies(""); setMaxVacancies(""); setClosingFrom(""); setClosingTo("");
    setHasSearched(false); setResults([]); setSearchError("");
  };

  const getTitle = (post: JobDiscoveryPost) =>
    language === "mr" ? post.title_mr || post.title_en || "" :
    language === "hi" ? post.title_hi || post.title_en || "" : post.title_en || "";
  const getSummary = (post: JobDiscoveryPost) =>
    language === "mr" ? post.summary_mr || post.summary_en || "" :
    language === "hi" ? post.summary_hi || post.summary_en || "" : post.summary_en || "";

  return (
    <>
      <div className="jobs-page">
        <main>
          <section className="jobs-hero">
            <div className="jobs-hero-content">
              <span className="jobs-eyebrow">{t("jobsEyebrow")}</span>
              <h1>{t("jobsHeroTitleLine1")}<br /><span>{t("jobsHeroTitleLine2")}</span></h1>
              <p>{t("jobsHeroDescription")}</p>
              <form className="jobs-search" onSubmit={(event) => { event.preventDefault(); setHasSearched(true); }}>
                <SearchIcon size={18} />
                <input value={query} onChange={(event) => { setQuery(event.target.value); setHasSearched(true); }} placeholder={t("jobsSearchPlaceholder")} />
                <button type="submit">{t("search")}</button>
              </form>
            </div>
            <div className="jobs-hero-visual" aria-hidden="true"><JobsCharacters /></div>
          </section>

          <section className="jobs-filter-panel" aria-label="Job filters">
            <div className="jobs-filter-heading">
              <div><h2>Find the right government job</h2><p>Filter opportunities by recruitment type, application mode and deadline.</p></div>
              <button type="button" className="jobs-clear-filters" onClick={clearFilters}>Clear filters</button>
            </div>
            <div className="jobs-filter-grid">
              <label>Recruitment type<select value={recruitmentType} onChange={(e) => { setRecruitmentType(e.target.value); setHasSearched(true); }}>{filterOptions.recruitment.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>Application mode<select value={applicationMode} onChange={(e) => { setApplicationMode(e.target.value); setHasSearched(true); }}>{filterOptions.mode.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>Application status<select value={applicationStatus} onChange={(e) => { setApplicationStatus(e.target.value); setHasSearched(true); }}>{filterOptions.status.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <label>Minimum vacancies<input type="number" min="0" value={minVacancies} onChange={(e) => { setMinVacancies(e.target.value); setHasSearched(true); }} placeholder="e.g. 10" /></label>
              <label>Maximum vacancies<input type="number" min="0" value={maxVacancies} onChange={(e) => { setMaxVacancies(e.target.value); setHasSearched(true); }} placeholder="e.g. 500" /></label>
              <label>Closing date from<input type="date" value={closingFrom} onChange={(e) => { setClosingFrom(e.target.value); setHasSearched(true); }} /></label>
              <label>Closing date to<input type="date" value={closingTo} onChange={(e) => { setClosingTo(e.target.value); setHasSearched(true); }} /></label>
              <label>Organization type<select value={organizationType} onChange={(e) => { setOrganizationType(e.target.value); setHasSearched(true); }}><option value="">All organizations</option>{facets.organization_types.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
              <label>Department<select value={department} onChange={(e) => { setDepartment(e.target.value); setHasSearched(true); }}><option value="">All departments</option>{facets.departments.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label>Designation<select value={designation} onChange={(e) => { setDesignation(e.target.value); setHasSearched(true); }}><option value="">All designations</option>{facets.designations.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label>Location<select value={location} onChange={(e) => { setLocation(e.target.value); setHasSearched(true); }}><option value="">All locations</option>{facets.locations.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label>State<select value={state} onChange={(e) => { setState(e.target.value); setHasSearched(true); }}><option value="">All states</option>{facets.states.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
              <label>Country<select value={country} onChange={(e) => { setCountry(e.target.value); setHasSearched(true); }}><option value="">All countries</option>{facets.countries.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            </div>
          </section>

          <section className="jobs-updates panel" id="updates">
            <div className="section-heading"><h2>{t("latestGovernmentJobs")}</h2><span>{displayedJobs.length} {t("updatesCount")}</span></div>
            <div className="update-list">
              {(!hasSearched && data.loading) || (hasSearched && searchLoading) ? <div className="empty-state empty-job">Loading...</div> : null}
              {!hasSearched && !data.loading && data.error ? <div className="empty-state empty-job">{data.error}</div> : null}
              {hasSearched && searchError ? <div className="empty-state empty-job">{searchError}</div> : null}
              {!hasSearched && !data.loading && !data.error && legacyJobs.length ? legacyJobs.map((item) => (
                <a className="update-row" key={item.id} href={`/jobs/${item.slug || createPostSlug(item.title)}`}>
                  <span className={`update-badge ${item.type}`}>{item.category}</span>
                  <span className="update-title">{item.title}<small>{item.description}</small></span>
                  <time>{item.date ? new Date(`${item.date}T12:00:00`).toLocaleDateString(locale,{day:"numeric",month:"short",year:"numeric"}) : t("new")}</time>
                  <span className="new-pill">{t("new")}</span>
                </a>
              )) : null}
              {hasSearched && !searchLoading && !searchError && results.map((post) => (
                <a className="update-row" key={post.id} href={`/jobs/${post.slug || createPostSlug(getTitle(post))}`}>
                  <span className="update-badge job">{post.job_details?.recruitment_type || "Job"}</span>
                  <span className="update-title">{getTitle(post)}<small>{[getSummary(post), post.job_details?.department, post.location, post.state].filter(Boolean).join(" · ")}</small></span>
                  <time>{post.published_at ? new Date(post.published_at).toLocaleDateString(locale,{day:"numeric",month:"short",year:"numeric"}) : t("new")}</time>
                  <span className="new-pill">{post.job_details?.total_vacancies ?? t("new")}</span>
                </a>
              ))}
              {((!hasSearched && !data.loading && !data.error && !legacyJobs.length) || (hasSearched && !searchLoading && !searchError && !results.length)) ? <div className="empty-state empty-job">{t("noJobsAvailable")}</div> : null}
            </div>
          </section>
        </main>
      </div>
      <PortalFooter />
    </>
  );
}
