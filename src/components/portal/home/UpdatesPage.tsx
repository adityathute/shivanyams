"use client";

import { useState } from "react";
import { UpdatesSection } from "../home/UpdatesSection";
import type { ItemType } from "../data/portal-data";
import { usePortalLanguage } from "../context/PortalLanguageContext";

export function UpdatesPage() {
  const { language } = usePortalLanguage();
  const [activeCategory, setActiveCategory] = useState<ItemType | "all">("all");

  return (
    <div className="portal">
      <main>
        <div className="updates-all-page">
          <UpdatesSection
            type={activeCategory}
            language={language}
            onTypeChange={setActiveCategory}
            showFilters
            showDateAndNewBadge={false}
            limit={null}
            showViewAll={false}
          />
        </div>
      </main>
    </div>
  );
}
