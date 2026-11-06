"use client";

import { useState } from "react";
import { HeroSection } from "./HeroSection";
import { CategoryGrid } from "./CategoryGrid";
import { UpdatesSection } from "./UpdatesSection";
import { VideosSection } from "./VideosSection";
import type { ItemType } from "./portal-data";
import { usePortalData } from "./portal-data";
import { PortalFooter } from "./PortalFooter";
import { MailIcon } from "shivanya-ui";
import { usePortalLanguage } from "./PortalLanguageContext";

export function HomePage() {
  const { language: selectedLanguage } = usePortalLanguage();
  const [active, setActive] = useState<ItemType | "all">("all");
  const [search, setSearch] = useState("");
  const { data } = usePortalData();

  return (
    <div className="portal">
      <div className="ticker">
        <span className="ticker-label">⚑ Latest Updates</span>
        <div className="ticker-track">
          {data.items.slice(0, 6).map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setSearch(item.title);
                setActive("all");
              }}
            >
              {item.title}
            </button>
          ))}
        </div>
        <button
          className="ticker-arrow"
          aria-label="Show all updates"
          onClick={() => {
            setActive("all");
            setSearch("");
          }}
        >
          ›
        </button>
      </div>

      <main>
        <HeroSection onSearch={setSearch} />
        <CategoryGrid language={selectedLanguage} />

        <div className="content-layout">
          <UpdatesSection
            type={active}
            language={selectedLanguage}
            query={search}
            onQueryChange={setSearch}
            onTypeChange={setActive}
          />
          <aside className="right-column">
            <section className="panelin important-panel">
              <div className="section-heading">
                <h2>महत्त्वाच्या लिंक्स</h2>
                <span>Useful links</span>
              </div>
              {[
                ["Aadhaar Services (UIDAI)", "https://uidai.gov.in/"],
                ["Voter Services Portal (ECI)", "https://voters.eci.gov.in/"],
                [
                  "Ayushman Bharat PM-JAY Beneficiary Portal",
                  "https://beneficiary.nha.gov.in/",
                ],
                ["ABHA Health ID Portal", "https://abha.abdm.gov.in/abha/v3"],
                [
                  "Maharashtra Farmer Registry (AgriStack)",
                  "https://mhfr.agristack.gov.in/farmer-registry-mh/#/",
                ],
                [
                  "Maharashtra Building and Other Construction Workers Welfare Board (MahaBOCW)",
                  "https://mahabocw.in/",
                ],
                [
                  "Unique Disability ID (UDID) Portal",
                  "https://swavlambancard.gov.in/",
                ],
                [
                  "Maharashtra Ration Card Management System (RCMS)",
                  "https://rcms.mahafood.gov.in/indexv.aspx",
                ],
                [
                  "Civil Registration System (Birth & Death Certificate)",
                  "https://dc.crsorgi.gov.in/crs/",
                ],
                [
                  "Mahaswayam Employment Portal",
                  "https://rojgar.mahaswayam.gov.in/#/home/index",
                ],
                [
                  "PM Vishwakarma Yojana Portal",
                  "https://pmvishwakarma.gov.in/",
                ],
                [
                  "National Payments Corporation of India (NPCI)",
                  "https://www.npci.org.in/",
                ],
                [
                  "Maharashtra Police Clearance Certificate Portal",
                  "https://pcs.mahaonline.gov.in/Forms/Home.aspx",
                ],
                [
                  "EPFO Member Portal (PF & UAN Services)",
                  "https://unifiedportal-mem.epfindia.gov.in/memberinterface/",
                ],
                [
                  "Passport Seva Portal",
                  "https://www.passportindia.gov.in/psp",
                ],
                [
                  "MahaDBT Scholarship and Benefit Portal",
                  "https://mahadbt2.maharashtra.gov.in/",
                ],
                [
                  "Mukhyamantri Majhi Ladki Bahin Yojana",
                  "https://ladakibahin.maharashtra.gov.in/",
                ],
                [
                  "Maharashtra e-Gazette – Application Status",
                  "https://egazzete.mahaonline.gov.in/FORMS/CitizenApplicationStatus.aspx?MenuID=1134",
                ],
                [
                  "Maharashtra Food and Civil Supplies Department",
                  "https://mahafood.gov.in/",
                ],
                ["PM-KISAN Samman Nidhi Portal", "https://pmkisan.gov.in/"],
                [
                  "Maharashtra FYJC (Class 11) Admission Portal",
                  "https://mahafyjcadmissions.in/landing",
                ],
                ["NEET UG Official Portal (NTA)", "https://neet.nta.nic.in/"],
                [
                  "JEE Main Official Portal (NTA)",
                  "https://jeemain.nta.nic.in/",
                ],
                [
                  "Maharashtra HMA / Marriage Registration Portal",
                  "https://hmasnew.mahait.org/",
                ],
                [
                  "Maharashtra State CET Cell – Admissions & Entrance Exams",
                  "https://cetcell.mahacet.org/",
                ],
              ].map(([label, url]) => (
                <a
                  className="important-link"
                  href={url}
                  key={label}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>✦</span>
                  {label}
                  <b>›</b>
                </a>
              ))}
            </section>

            <section className="subscribe-panel">
              <div className="subscribe-icon">
                <MailIcon />
              </div>

              <div className="subscribe-content">
                <h3>नवीन अपडेट्ससाठी तयार राहा</h3>
                <p>महत्त्वाच्या अपडेट्ससाठी आमच्याशी जोडलेले राहा.</p>
              </div>

              <a href="#contact" className="subscribe-button">
                संपर्क साधा →
              </a>
            </section>
          </aside>
        </div>

        <VideosSection />
      </main>

      <PortalFooter />
    </div>
  );
}
