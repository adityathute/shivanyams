<!-- File Location: shivanyams/PROJECT_STRUCTURE.md -->
<!-- Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified) -->
<!-- Cleanup Status: Clean -->
<!-- Cleanup Info: Complete Git-tree inventory with per-file cleanup status and directory-based Legacy/Organized classification; generated and unreviewed files remain explicitly identified. -->

# ShivanyaMS V2 — Complete Project Structure

**Repository:** `adityathute/shivanyams`  
**Branch:** `shiv-v2`  
**Source snapshot:** `4410f33f7ab29af39c4b34337e5a4fcc18330005`  
**Inventory rule:** Every tracked file in the source snapshot plus this inventory file itself is listed below. New or moved files must be added/updated in the next report refresh.

## Summary

| Metric | Count |
|---|---:|
| Total tracked files after this inventory update | 310 |
| Clean | 35 |
| Cleanup Pending | 16 |
| Not Reviewed | 259 |
| Organized | 254 |
| Legacy | 56 |
| Audited before this structure update | 50 |

**Classification note:** `Legacy` is assigned to files under `src/styles/legacy/`. Other files are classified as `Organized` based on their current repository placement. This is a folder-structure classification, not a claim that every Not Reviewed file has been code-audited. Cleanup Status and Structure Status are independent.

**Generated-file exception:** `shivanyams/next-env.d.ts` is Cleanup Pending because Next.js marks it as generated and says it should not be edited. Do not add a custom header to it.

## Complete tracked-file register

| # | Full repository-root path | Cleanup Status | Structure |
|---:|---|---|---|
| 1 | `shivanyams/.env.local.example` | Not Reviewed | Organized |
| 2 | `shivanyams/.github/workflows/ci.yml` | Not Reviewed | Organized |
| 3 | `shivanyams/.gitignore` | Not Reviewed | Organized |
| 4 | `shivanyams/AGENTS.md` | Not Reviewed | Organized |
| 5 | `shivanyams/PROJECT_REPORTS.md` | Not Reviewed | Organized |
| 6 | `shivanyams/PROJECT_STRUCTURE.md` | Clean | Organized |
| 7 | `shivanyams/README.md` | Not Reviewed | Organized |
| 8 | `shivanyams/backend/.env.example` | Not Reviewed | Organized |
| 9 | `shivanyams/backend/.gitignore` | Not Reviewed | Organized |
| 10 | `shivanyams/backend/README.md` | Not Reviewed | Organized |
| 11 | `shivanyams/backend/apps/__init__.py` | Not Reviewed | Organized |
| 12 | `shivanyams/backend/apps/portal/__init__.py` | Not Reviewed | Organized |
| 13 | `shivanyams/backend/apps/portal/admin.py` | Not Reviewed | Organized |
| 14 | `shivanyams/backend/apps/portal/apps.py` | Not Reviewed | Organized |
| 15 | `shivanyams/backend/apps/portal/authentication.py` | Not Reviewed | Organized |
| 16 | `shivanyams/backend/apps/portal/comment_moderation.py` | Not Reviewed | Organized |
| 17 | `shivanyams/backend/apps/portal/data/__init__.py` | Not Reviewed | Organized |
| 18 | `shivanyams/backend/apps/portal/data/categories.py` | Not Reviewed | Organized |
| 19 | `shivanyams/backend/apps/portal/management/__init__.py` | Not Reviewed | Organized |
| 20 | `shivanyams/backend/apps/portal/management/commands/__init__.py` | Not Reviewed | Organized |
| 21 | `shivanyams/backend/apps/portal/management/commands/seed_portal_categories.py` | Not Reviewed | Organized |
| 22 | `shivanyams/backend/apps/portal/migrations/0001_initial.py` | Not Reviewed | Organized |
| 23 | `shivanyams/backend/apps/portal/migrations/0002_rename_description_category_description_en_and_more.py` | Not Reviewed | Organized |
| 24 | `shivanyams/backend/apps/portal/migrations/0003_importantlink.py` | Not Reviewed | Organized |
| 25 | `shivanyams/backend/apps/portal/migrations/0004_job_advertisement_fields.py` | Not Reviewed | Organized |
| 26 | `shivanyams/backend/apps/portal/migrations/0005_admitcarddetails_articleguidedetails_comment_and_more.py` | Not Reviewed | Organized |
| 27 | `shivanyams/backend/apps/portal/migrations/0006_importantlink.py` | Not Reviewed | Organized |
| 28 | `shivanyams/backend/apps/portal/migrations/0007_simplify_post_organization.py` | Not Reviewed | Organized |
| 29 | `shivanyams/backend/apps/portal/migrations/0008_remove_post_portal_post_organiz_7ede86_idx_and_more.py` | Not Reviewed | Organized |
| 30 | `shivanyams/backend/apps/portal/migrations/0009_postdate_date_format_postdate_end_date_and_more.py` | Not Reviewed | Organized |
| 31 | `shivanyams/backend/apps/portal/migrations/0010_jobagerelaxation_jobdetails_age_as_on_date_and_more.py` | Not Reviewed | Organized |
| 32 | `shivanyams/backend/apps/portal/migrations/0011_post_engagement_comments.py` | Not Reviewed | Organized |
| 33 | `shivanyams/backend/apps/portal/migrations/0011_remove_jobagerelaxation_portal_joba_job_id_8cf78a_idx_and_more.py` | Not Reviewed | Organized |
| 34 | `shivanyams/backend/apps/portal/migrations/0012_remove_jobdetails_fee_payment_mode_and_more.py` | Not Reviewed | Organized |
| 35 | `shivanyams/backend/apps/portal/migrations/0013_postdate_month_years.py` | Not Reviewed | Organized |
| 36 | `shivanyams/backend/apps/portal/migrations/0014_jobpost_jobpostfee_jobpost_unique_job_post_number_and_more.py` | Not Reviewed | Organized |
| 37 | `shivanyams/backend/apps/portal/migrations/0015_make_common_job_age_optional.py` | Not Reviewed | Organized |
| 38 | `shivanyams/backend/apps/portal/migrations/0016_jobdetails_shared_detail_modes.py` | Not Reviewed | Organized |
| 39 | `shivanyams/backend/apps/portal/migrations/0017_jobposteducation.py` | Not Reviewed | Organized |
| 40 | `shivanyams/backend/apps/portal/migrations/0018_postlink_action_texts.py` | Not Reviewed | Organized |
| 41 | `shivanyams/backend/apps/portal/migrations/0019_postlink_group_key.py` | Not Reviewed | Organized |
| 42 | `shivanyams/backend/apps/portal/migrations/0020_postfaq.py` | Not Reviewed | Organized |
| 43 | `shivanyams/backend/apps/portal/migrations/0020_postversion_updated_at.py` | Not Reviewed | Organized |
| 44 | `shivanyams/backend/apps/portal/migrations/0021_rename_portal_faq_post_act_idx_portal_post_post_id_16f132_idx_and_more.py` | Not Reviewed | Organized |
| 45 | `shivanyams/backend/apps/portal/migrations/0022_website_analytics.py` | Not Reviewed | Organized |
| 46 | `shivanyams/backend/apps/portal/migrations/0023_website_visitor_details.py` | Not Reviewed | Organized |
| 47 | `shivanyams/backend/apps/portal/migrations/0024_rename_portal_post_visitor_04b834_idx_portal_web_visit_view_idx.py` | Not Reviewed | Organized |
| 48 | `shivanyams/backend/apps/portal/migrations/0024_website_browser_analytics.py` | Not Reviewed | Organized |
| 49 | `shivanyams/backend/apps/portal/migrations/0025_merge_20261120_2323.py` | Not Reviewed | Organized |
| 50 | `shivanyams/backend/apps/portal/migrations/0026_newsletter_and_post_reports.py` | Not Reviewed | Organized |
| 51 | `shivanyams/backend/apps/portal/migrations/0027_comment_author_profile.py` | Not Reviewed | Organized |
| 52 | `shivanyams/backend/apps/portal/migrations/0028_merge_20261121.py` | Not Reviewed | Organized |
| 53 | `shivanyams/backend/apps/portal/migrations/0029_allow_three_reports_per_user.py` | Not Reviewed | Organized |
| 54 | `shivanyams/backend/apps/portal/migrations/0030_allow_legacy_jobpost_age_relaxations_null.py` | Not Reviewed | Organized |
| 55 | `shivanyams/backend/apps/portal/migrations/0031_allow_legacy_jobpost_education_requirements_null.py` | Not Reviewed | Organized |
| 56 | `shivanyams/backend/apps/portal/migrations/0032_remove_obsolete_jobpost_columns.py` | Not Reviewed | Organized |
| 57 | `shivanyams/backend/apps/portal/migrations/0033_remove_all_obsolete_jobpost_columns.py` | Not Reviewed | Organized |
| 58 | `shivanyams/backend/apps/portal/migrations/0034_remove_obsolete_jobpostfee_columns.py` | Not Reviewed | Organized |
| 59 | `shivanyams/backend/apps/portal/migrations/0035_postversion.py` | Not Reviewed | Organized |
| 60 | `shivanyams/backend/apps/portal/migrations/0036_remove_unused_job_salary_fields.py` | Not Reviewed | Organized |
| 61 | `shivanyams/backend/apps/portal/migrations/0037_remove_legacy_job_salary_period.py` | Not Reviewed | Organized |
| 62 | `shivanyams/backend/apps/portal/migrations/0038_remove_legacy_job_pay_scale.py` | Not Reviewed | Organized |
| 63 | `shivanyams/backend/apps/portal/migrations/0039_remove_legacy_job_grade_pay.py` | Not Reviewed | Organized |
| 64 | `shivanyams/backend/apps/portal/migrations/0040_remove_legacy_job_employment_terms.py` | Not Reviewed | Organized |
| 65 | `shivanyams/backend/apps/portal/migrations/0041_cleanup_legacy_job_schema_drift.py` | Not Reviewed | Organized |
| 66 | `shivanyams/backend/apps/portal/migrations/0042_global_newsletter_subscriptions.py` | Not Reviewed | Organized |
| 67 | `shivanyams/backend/apps/portal/migrations/0043_merge_postversion_timestamp_and_newsletter.py` | Not Reviewed | Organized |
| 68 | `shivanyams/backend/apps/portal/migrations/0044_postquestion.py` | Not Reviewed | Organized |
| 69 | `shivanyams/backend/apps/portal/migrations/0045_postquestion_answer_visibility.py` | Not Reviewed | Organized |
| 70 | `shivanyams/backend/apps/portal/migrations/0046_postquestion_answer_visibility_choices.py` | Not Reviewed | Organized |
| 71 | `shivanyams/backend/apps/portal/migrations/0047_postquestion_helpful_vote.py` | Not Reviewed | Organized |
| 72 | `shivanyams/backend/apps/portal/migrations/0048_unique_post_question_helpful_user.py` | Not Reviewed | Organized |
| 73 | `shivanyams/backend/apps/portal/migrations/0049_postquestion_status.py` | Not Reviewed | Organized |
| 74 | `shivanyams/backend/apps/portal/migrations/0050_tooldetails_tool_key_optional.py` | Not Reviewed | Organized |
| 75 | `shivanyams/backend/apps/portal/migrations/__init__.py` | Not Reviewed | Organized |
| 76 | `shivanyams/backend/apps/portal/models.py` | Not Reviewed | Organized |
| 77 | `shivanyams/backend/apps/portal/permissions.py` | Not Reviewed | Organized |
| 78 | `shivanyams/backend/apps/portal/serializers.py` | Not Reviewed | Organized |
| 79 | `shivanyams/backend/apps/portal/urls.py` | Not Reviewed | Organized |
| 80 | `shivanyams/backend/apps/portal/views.py` | Not Reviewed | Organized |
| 81 | `shivanyams/backend/config/__init__.py` | Not Reviewed | Organized |
| 82 | `shivanyams/backend/config/asgi.py` | Not Reviewed | Organized |
| 83 | `shivanyams/backend/config/settings.py` | Not Reviewed | Organized |
| 84 | `shivanyams/backend/config/urls.py` | Not Reviewed | Organized |
| 85 | `shivanyams/backend/config/wsgi.py` | Not Reviewed | Organized |
| 86 | `shivanyams/backend/manage.py` | Not Reviewed | Organized |
| 87 | `shivanyams/backend/requirements.txt` | Not Reviewed | Organized |
| 88 | `shivanyams/eslint.config.mjs` | Not Reviewed | Organized |
| 89 | `shivanyams/next-env.d.ts` | Cleanup Pending | Organized |
| 90 | `shivanyams/next.config.ts` | Cleanup Pending | Organized |
| 91 | `shivanyams/package-lock.json` | Not Reviewed | Organized |
| 92 | `shivanyams/package.json` | Not Reviewed | Organized |
| 93 | `shivanyams/public/fonts/Hind-Bold.ttf` | Not Reviewed | Organized |
| 94 | `shivanyams/public/fonts/Hind-Medium.ttf` | Not Reviewed | Organized |
| 95 | `shivanyams/public/fonts/Hind-Regular.ttf` | Not Reviewed | Organized |
| 96 | `shivanyams/public/fonts/Hind-SemiBold.ttf` | Not Reviewed | Organized |
| 97 | `shivanyams/public/fonts/OFL-Hind.txt` | Not Reviewed | Organized |
| 98 | `shivanyams/public/images/404-img.png` | Not Reviewed | Organized |
| 99 | `shivanyams/public/images/admits-image007.png` | Not Reviewed | Organized |
| 100 | `shivanyams/public/images/exam-image.png` | Not Reviewed | Organized |
| 101 | `shivanyams/public/images/guides-image.png` | Not Reviewed | Organized |
| 102 | `shivanyams/public/images/jobs-image.png` | Not Reviewed | Organized |
| 103 | `shivanyams/public/images/result-image.png` | Not Reviewed | Organized |
| 104 | `shivanyams/public/images/scheme-image.png` | Not Reviewed | Organized |
| 105 | `shivanyams/public/images/tools-image.png` | Not Reviewed | Organized |
| 106 | `shivanyams/public/images/videos-image.png` | Not Reviewed | Organized |
| 107 | `shivanyams/public/logo.png` | Not Reviewed | Organized |
| 108 | `shivanyams/public/shivanya-logo-light.png` | Not Reviewed | Organized |
| 109 | `shivanyams/public/theme-init.js` | Clean | Organized |
| 110 | `shivanyams/src/app/about/page.tsx` | Clean | Organized |
| 111 | `shivanyams/src/app/admin/add-content/page.tsx` | Cleanup Pending | Organized |
| 112 | `shivanyams/src/app/admin/add-post/page.tsx` | Clean | Organized |
| 113 | `shivanyams/src/app/admin/admin-utils.ts` | Clean | Organized |
| 114 | `shivanyams/src/app/admin/comments/page.tsx` | Cleanup Pending | Organized |
| 115 | `shivanyams/src/app/admin/edit-post/[kind]/[slug]/page.tsx` | Clean | Organized |
| 116 | `shivanyams/src/app/admin/engagement/[postId]/page.tsx` | Cleanup Pending | Organized |
| 117 | `shivanyams/src/app/admin/page.tsx` | Cleanup Pending | Organized |
| 118 | `shivanyams/src/app/admin/preview/[kind]/[slug]/page.tsx` | Cleanup Pending | Organized |
| 119 | `shivanyams/src/app/admin/questions/page.tsx` | Cleanup Pending | Organized |
| 120 | `shivanyams/src/app/admin/reports/page.tsx` | Cleanup Pending | Organized |
| 121 | `shivanyams/src/app/admin/tags/AdminTagsPage.tsx` | Cleanup Pending | Organized |
| 122 | `shivanyams/src/app/admin/tags/page.tsx` | Clean | Organized |
| 123 | `shivanyams/src/app/admit-cards/[slug]/page.tsx` | Clean | Organized |
| 124 | `shivanyams/src/app/admit-cards/page.tsx` | Clean | Organized |
| 125 | `shivanyams/src/app/batch-examination/page.tsx` | Clean | Organized |
| 126 | `shivanyams/src/app/contact/page.tsx` | Clean | Organized |
| 127 | `shivanyams/src/app/disclaimer/page.tsx` | Clean | Organized |
| 128 | `shivanyams/src/app/examination/[slug]/page.tsx` | Clean | Organized |
| 129 | `shivanyams/src/app/examination/page.tsx` | Clean | Organized |
| 130 | `shivanyams/src/app/exams/page.tsx` | Clean | Organized |
| 131 | `shivanyams/src/app/feedback/page.tsx` | Clean | Organized |
| 132 | `shivanyams/src/app/guides/[slug]/page.tsx` | Clean | Organized |
| 133 | `shivanyams/src/app/guides/page.tsx` | Clean | Organized |
| 134 | `shivanyams/src/app/jobs/[slug]/page.tsx` | Clean | Organized |
| 135 | `shivanyams/src/app/jobs/page.tsx` | Clean | Organized |
| 136 | `shivanyams/src/app/jobs/related/[filterType]/[slug]/page.tsx` | Clean | Organized |
| 137 | `shivanyams/src/app/layout.tsx` | Cleanup Pending | Organized |
| 138 | `shivanyams/src/app/ledger/accounts/page.tsx` | Cleanup Pending | Organized |
| 139 | `shivanyams/src/app/ledger/ledger.module.css` | Cleanup Pending | Organized |
| 140 | `shivanyams/src/app/ledger/page.tsx` | Cleanup Pending | Organized |
| 141 | `shivanyams/src/app/ledger/setup/page.tsx` | Cleanup Pending | Organized |
| 142 | `shivanyams/src/app/ledger/transactions/page.tsx` | Cleanup Pending | Organized |
| 143 | `shivanyams/src/app/page.tsx` | Clean | Organized |
| 144 | `shivanyams/src/app/privacy/page.tsx` | Clean | Organized |
| 145 | `shivanyams/src/app/results/[slug]/page.tsx` | Clean | Organized |
| 146 | `shivanyams/src/app/results/page.tsx` | Clean | Organized |
| 147 | `shivanyams/src/app/saved/page.tsx` | Clean | Organized |
| 148 | `shivanyams/src/app/schemes/[slug]/page.tsx` | Clean | Organized |
| 149 | `shivanyams/src/app/schemes/page.tsx` | Clean | Organized |
| 150 | `shivanyams/src/app/tags/[slug]/page.tsx` | Clean | Organized |
| 151 | `shivanyams/src/app/tags/page.tsx` | Clean | Organized |
| 152 | `shivanyams/src/app/terms/page.tsx` | Clean | Organized |
| 153 | `shivanyams/src/app/tools/[slug]/page.tsx` | Clean | Organized |
| 154 | `shivanyams/src/app/tools/page.tsx` | Clean | Organized |
| 155 | `shivanyams/src/app/videos/[slug]/page.tsx` | Clean | Organized |
| 156 | `shivanyams/src/app/videos/page.tsx` | Clean | Organized |
| 157 | `shivanyams/src/components/admin/PostEditor.tsx` | Not Reviewed | Organized |
| 158 | `shivanyams/src/components/admitCard/AdmitCardsCharacters.tsx` | Not Reviewed | Organized |
| 159 | `shivanyams/src/components/admitCard/AdmitCardsPage.tsx` | Not Reviewed | Organized |
| 160 | `shivanyams/src/components/animation/BanyanTree/BanyanTree.tsx` | Not Reviewed | Organized |
| 161 | `shivanyams/src/components/animation/Birds/Birds.tsx` | Not Reviewed | Organized |
| 162 | `shivanyams/src/components/animation/Clock/PortalClock.tsx` | Not Reviewed | Organized |
| 163 | `shivanyams/src/components/animation/Clouds/Clouds.tsx` | Not Reviewed | Organized |
| 164 | `shivanyams/src/components/animation/GovernmentBuilding/GovernmentBuilding.tsx` | Not Reviewed | Organized |
| 165 | `shivanyams/src/components/animation/HillFlowers/HillFlowers.tsx` | Not Reviewed | Organized |
| 166 | `shivanyams/src/components/animation/LandscapeTerrain/LandscapeTerrain.tsx` | Not Reviewed | Organized |
| 167 | `shivanyams/src/components/animation/Moon/Moon.tsx` | Not Reviewed | Organized |
| 168 | `shivanyams/src/components/animation/Stars/Stars.tsx` | Not Reviewed | Organized |
| 169 | `shivanyams/src/components/animation/Sun/Sun.tsx` | Not Reviewed | Organized |
| 170 | `shivanyams/src/components/examination/ExaminationCharacters.tsx` | Not Reviewed | Organized |
| 171 | `shivanyams/src/components/examination/ExaminationPage.tsx` | Not Reviewed | Organized |
| 172 | `shivanyams/src/components/guide/GuidesCharacters.tsx` | Not Reviewed | Organized |
| 173 | `shivanyams/src/components/guide/GuidesPage.tsx` | Not Reviewed | Organized |
| 174 | `shivanyams/src/components/jobs/JobsCharacters.tsx` | Not Reviewed | Organized |
| 175 | `shivanyams/src/components/jobs/JobsPage.tsx` | Not Reviewed | Organized |
| 176 | `shivanyams/src/components/portal/RelatedJobsPage.tsx` | Not Reviewed | Organized |
| 177 | `shivanyams/src/components/portal/TagsPage.tsx` | Not Reviewed | Organized |
| 178 | `shivanyams/src/components/portal/category/CategoryGrid.tsx` | Not Reviewed | Organized |
| 179 | `shivanyams/src/components/portal/category/CategoryPage.tsx` | Not Reviewed | Organized |
| 180 | `shivanyams/src/components/portal/category/PortalEmptyState.tsx` | Not Reviewed | Organized |
| 181 | `shivanyams/src/components/portal/context/PortalAuthContext.tsx` | Not Reviewed | Organized |
| 182 | `shivanyams/src/components/portal/context/PortalLanguageContext.tsx` | Not Reviewed | Organized |
| 183 | `shivanyams/src/components/portal/data/portal-data.tsx` | Not Reviewed | Organized |
| 184 | `shivanyams/src/components/portal/home/HeroSection.tsx` | Not Reviewed | Organized |
| 185 | `shivanyams/src/components/portal/home/HomePage.tsx` | Not Reviewed | Organized |
| 186 | `shivanyams/src/components/portal/home/UpdatesSection.tsx` | Not Reviewed | Organized |
| 187 | `shivanyams/src/components/portal/language/LanguageDropdown.tsx` | Not Reviewed | Organized |
| 188 | `shivanyams/src/components/portal/layout/PortalLayout.tsx` | Not Reviewed | Organized |
| 189 | `shivanyams/src/components/portal/layout/footer/PortalFooter.tsx` | Not Reviewed | Organized |
| 190 | `shivanyams/src/components/portal/layout/footer/SiteMobileFooter.tsx` | Not Reviewed | Organized |
| 191 | `shivanyams/src/components/portal/layout/header/PortalHeader.tsx` | Not Reviewed | Organized |
| 192 | `shivanyams/src/components/portal/layout/header/PortalUserDropdown.tsx` | Not Reviewed | Organized |
| 193 | `shivanyams/src/components/portal/layout/sidebar/PortalSidebar.tsx` | Not Reviewed | Organized |
| 194 | `shivanyams/src/components/portal/post/NewsletterSubscribeButton.tsx` | Not Reviewed | Organized |
| 195 | `shivanyams/src/components/portal/post/PortalContentNotFound.tsx` | Not Reviewed | Organized |
| 196 | `shivanyams/src/components/portal/post/PortalPostDetail.tsx` | Not Reviewed | Organized |
| 197 | `shivanyams/src/components/portal/post/PostCommentsSection.tsx` | Not Reviewed | Organized |
| 198 | `shivanyams/src/components/portal/post/PostEngagementActions.tsx` | Not Reviewed | Organized |
| 199 | `shivanyams/src/components/portal/post/PostFAQSection.tsx` | Not Reviewed | Organized |
| 200 | `shivanyams/src/components/portal/post/comment-moderation.ts` | Not Reviewed | Organized |
| 201 | `shivanyams/src/components/portal/post/not-found-recommendations-config.ts` | Not Reviewed | Organized |
| 202 | `shivanyams/src/components/portal/post/post-sidebar-config.ts` | Not Reviewed | Organized |
| 203 | `shivanyams/src/components/portal/saved/SavedPostsPage.tsx` | Not Reviewed | Organized |
| 204 | `shivanyams/src/components/portal/utils/important-links-config.ts` | Not Reviewed | Organized |
| 205 | `shivanyams/src/components/portal/utils/job-deadline.ts` | Not Reviewed | Organized |
| 206 | `shivanyams/src/components/portal/utils/useImportantLinks.ts` | Not Reviewed | Organized |
| 207 | `shivanyams/src/components/results/ResultsCharacters.tsx` | Not Reviewed | Organized |
| 208 | `shivanyams/src/components/results/ResultsPage.tsx` | Not Reviewed | Organized |
| 209 | `shivanyams/src/components/scheme/SchemesCharacters.tsx` | Not Reviewed | Organized |
| 210 | `shivanyams/src/components/scheme/SchemesPage.tsx` | Not Reviewed | Organized |
| 211 | `shivanyams/src/components/static-pages/About/AboutPage.tsx` | Not Reviewed | Organized |
| 212 | `shivanyams/src/components/static-pages/Contact/ContactPage.tsx` | Not Reviewed | Organized |
| 213 | `shivanyams/src/components/static-pages/Disclaimer/DisclaimerPage.tsx` | Not Reviewed | Organized |
| 214 | `shivanyams/src/components/static-pages/Feedback/FeedbackPage.tsx` | Not Reviewed | Organized |
| 215 | `shivanyams/src/components/static-pages/Privacy/PrivacyPage.tsx` | Not Reviewed | Organized |
| 216 | `shivanyams/src/components/static-pages/Terms/TermsPage.tsx` | Not Reviewed | Organized |
| 217 | `shivanyams/src/components/tools/ToolsCharacters.tsx` | Not Reviewed | Organized |
| 218 | `shivanyams/src/components/tools/ToolsPage.tsx` | Not Reviewed | Organized |
| 219 | `shivanyams/src/components/videos/VideosCharacters.tsx` | Not Reviewed | Organized |
| 220 | `shivanyams/src/components/videos/VideosPage.tsx` | Not Reviewed | Organized |
| 221 | `shivanyams/src/components/videos/VideosSection.tsx` | Not Reviewed | Organized |
| 222 | `shivanyams/src/config/COMMENT-MODERATION.md` | Not Reviewed | Organized |
| 223 | `shivanyams/src/config/comment-moderation-words.json` | Not Reviewed | Organized |
| 224 | `shivanyams/src/data/portal/categories.ts` | Not Reviewed | Organized |
| 225 | `shivanyams/src/i18n/dictionaries/AboutPageDictionary.ts` | Not Reviewed | Organized |
| 226 | `shivanyams/src/i18n/dictionaries/ContactPageDictionary.ts` | Not Reviewed | Organized |
| 227 | `shivanyams/src/i18n/dictionaries/DisclaimerPageDictionary.ts` | Not Reviewed | Organized |
| 228 | `shivanyams/src/i18n/dictionaries/FeedbackPageDictionary.ts` | Not Reviewed | Organized |
| 229 | `shivanyams/src/i18n/dictionaries/PrivacyPageDictionary.ts` | Not Reviewed | Organized |
| 230 | `shivanyams/src/i18n/dictionaries/TermsPageDictionary.ts` | Not Reviewed | Organized |
| 231 | `shivanyams/src/i18n/dictionaries/base.ts` | Not Reviewed | Organized |
| 232 | `shivanyams/src/i18n/dictionaries/portal-dictionary.ts` | Not Reviewed | Organized |
| 233 | `shivanyams/src/i18n/organized/dictionaries/sidebar.ts` | Not Reviewed | Organized |
| 234 | `shivanyams/src/lib/authenticated-fetch.ts` | Not Reviewed | Organized |
| 235 | `shivanyams/src/lib/format-number.ts` | Not Reviewed | Organized |
| 236 | `shivanyams/src/styles/css.config.ts` | Not Reviewed | Organized |
| 237 | `shivanyams/src/styles/legacy/app/admin/add-post/AddPostPage.css` | Not Reviewed | Legacy |
| 238 | `shivanyams/src/styles/legacy/app/admin/admin.css` | Not Reviewed | Legacy |
| 239 | `shivanyams/src/styles/legacy/app/admin/comments/comments.css` | Not Reviewed | Legacy |
| 240 | `shivanyams/src/styles/legacy/app/admin/engagement/[postId]/engagement.css` | Not Reviewed | Legacy |
| 241 | `shivanyams/src/styles/legacy/app/admin/questions/questions.css` | Not Reviewed | Legacy |
| 242 | `shivanyams/src/styles/legacy/app/admin/reports/reports.css` | Not Reviewed | Legacy |
| 243 | `shivanyams/src/styles/legacy/app/admin/tags/tags.css` | Not Reviewed | Legacy |
| 244 | `shivanyams/src/styles/legacy/app/globals.css` | Not Reviewed | Legacy |
| 245 | `shivanyams/src/styles/legacy/app/portal-base.css` | Not Reviewed | Legacy |
| 246 | `shivanyams/src/styles/legacy/components/admin/PostEditor.css` | Not Reviewed | Legacy |
| 247 | `shivanyams/src/styles/legacy/components/admitCard/AdmitCardsCharacters.css` | Not Reviewed | Legacy |
| 248 | `shivanyams/src/styles/legacy/components/admitCard/AdmitCardsPage.css` | Not Reviewed | Legacy |
| 249 | `shivanyams/src/styles/legacy/components/animation/BanyanTree/BanyanTree.css` | Not Reviewed | Legacy |
| 250 | `shivanyams/src/styles/legacy/components/animation/Clock/PortalClock.css` | Not Reviewed | Legacy |
| 251 | `shivanyams/src/styles/legacy/components/animation/Clouds/Clouds.css` | Not Reviewed | Legacy |
| 252 | `shivanyams/src/styles/legacy/components/animation/GovernmentBuilding/GovernmentBuilding.css` | Not Reviewed | Legacy |
| 253 | `shivanyams/src/styles/legacy/components/animation/HillFlowers/HillFlowers.css` | Not Reviewed | Legacy |
| 254 | `shivanyams/src/styles/legacy/components/animation/LandscapeTerrain/LandscapeTerrain.css` | Not Reviewed | Legacy |
| 255 | `shivanyams/src/styles/legacy/components/animation/Moon/Moon.css` | Not Reviewed | Legacy |
| 256 | `shivanyams/src/styles/legacy/components/animation/Stars/Stars.css` | Not Reviewed | Legacy |
| 257 | `shivanyams/src/styles/legacy/components/animation/Sun/Sun.css` | Not Reviewed | Legacy |
| 258 | `shivanyams/src/styles/legacy/components/examination/ExaminationCharacters.css` | Not Reviewed | Legacy |
| 259 | `shivanyams/src/styles/legacy/components/guide/GuidesCharacters.css` | Not Reviewed | Legacy |
| 260 | `shivanyams/src/styles/legacy/components/guide/GuidesPage.css` | Not Reviewed | Legacy |
| 261 | `shivanyams/src/styles/legacy/components/jobs/JobsCharacters.css` | Not Reviewed | Legacy |
| 262 | `shivanyams/src/styles/legacy/components/jobs/JobsPage.css` | Not Reviewed | Legacy |
| 263 | `shivanyams/src/styles/legacy/components/portal/RelatedJobsPage.css` | Not Reviewed | Legacy |
| 264 | `shivanyams/src/styles/legacy/components/portal/category/CategoryGrid.css` | Not Reviewed | Legacy |
| 265 | `shivanyams/src/styles/legacy/components/portal/category/CategoryPage.css` | Not Reviewed | Legacy |
| 266 | `shivanyams/src/styles/legacy/components/portal/home/HeroSection.css` | Not Reviewed | Legacy |
| 267 | `shivanyams/src/styles/legacy/components/portal/home/UpdatesSection.css` | Not Reviewed | Legacy |
| 268 | `shivanyams/src/styles/legacy/components/portal/language/LanguageDropdown.css` | Not Reviewed | Legacy |
| 269 | `shivanyams/src/styles/legacy/components/portal/layout/PortalShell.css` | Not Reviewed | Legacy |
| 270 | `shivanyams/src/styles/legacy/components/portal/layout/footer/SiteMobileFooter.css` | Not Reviewed | Legacy |
| 271 | `shivanyams/src/styles/legacy/components/portal/post/NewsletterSubscribeButton.css` | Not Reviewed | Legacy |
| 272 | `shivanyams/src/styles/legacy/components/portal/post/PortalContentNotFound.css` | Not Reviewed | Legacy |
| 273 | `shivanyams/src/styles/legacy/components/portal/post/PortalPostDetail.css` | Not Reviewed | Legacy |
| 274 | `shivanyams/src/styles/legacy/components/portal/post/PostCommentsSection.css` | Not Reviewed | Legacy |
| 275 | `shivanyams/src/styles/legacy/components/portal/post/PostEngagementActions.css` | Not Reviewed | Legacy |
| 276 | `shivanyams/src/styles/legacy/components/portal/post/PostFAQSection.css` | Not Reviewed | Legacy |
| 277 | `shivanyams/src/styles/legacy/components/portal/saved/SavedPostsPage.css` | Not Reviewed | Legacy |
| 278 | `shivanyams/src/styles/legacy/components/results/ResultsCharacters.css` | Not Reviewed | Legacy |
| 279 | `shivanyams/src/styles/legacy/components/results/ResultsPage.css` | Not Reviewed | Legacy |
| 280 | `shivanyams/src/styles/legacy/components/scheme/SchemesCharacters.css` | Not Reviewed | Legacy |
| 281 | `shivanyams/src/styles/legacy/components/scheme/SchemesPage.css` | Not Reviewed | Legacy |
| 282 | `shivanyams/src/styles/legacy/components/static-pages/About/AboutPage.css` | Not Reviewed | Legacy |
| 283 | `shivanyams/src/styles/legacy/components/static-pages/Contact/ContactPage.css` | Not Reviewed | Legacy |
| 284 | `shivanyams/src/styles/legacy/components/static-pages/Disclaimer/DisclaimerPage.css` | Not Reviewed | Legacy |
| 285 | `shivanyams/src/styles/legacy/components/static-pages/Feedback/FeedbackPage.css` | Not Reviewed | Legacy |
| 286 | `shivanyams/src/styles/legacy/components/static-pages/Privacy/PrivacyPage.css` | Not Reviewed | Legacy |
| 287 | `shivanyams/src/styles/legacy/components/static-pages/Terms/TermsPage.css` | Not Reviewed | Legacy |
| 288 | `shivanyams/src/styles/legacy/components/tools/ToolsCharacters.css` | Not Reviewed | Legacy |
| 289 | `shivanyams/src/styles/legacy/components/tools/ToolsPage.css` | Not Reviewed | Legacy |
| 290 | `shivanyams/src/styles/legacy/components/videos/VideosCharacters.css` | Not Reviewed | Legacy |
| 291 | `shivanyams/src/styles/legacy/components/videos/VideosPage.css` | Not Reviewed | Legacy |
| 292 | `shivanyams/src/styles/legacy/components/videos/VideosSection.css` | Not Reviewed | Legacy |
| 293 | `shivanyams/src/styles/organized/AI-GUIDE.md` | Not Reviewed | Organized |
| 294 | `shivanyams/src/styles/organized/admin/.gitkeep` | Not Reviewed | Organized |
| 295 | `shivanyams/src/styles/organized/components/.gitkeep` | Not Reviewed | Organized |
| 296 | `shivanyams/src/styles/organized/components/portal/category/CategoryBadge.css` | Not Reviewed | Organized |
| 297 | `shivanyams/src/styles/organized/components/portal/category/CategoryGrid.css` | Not Reviewed | Organized |
| 298 | `shivanyams/src/styles/organized/components/portal/category/CategoryPageUpdates.css` | Not Reviewed | Organized |
| 299 | `shivanyams/src/styles/organized/components/portal/home/HomeResponsive.css` | Not Reviewed | Organized |
| 300 | `shivanyams/src/styles/organized/components/portal/home/LatestUpdatesTicker.css` | Not Reviewed | Organized |
| 301 | `shivanyams/src/styles/organized/components/portal/layout/PortalFooter.css` | Not Reviewed | Organized |
| 302 | `shivanyams/src/styles/organized/components/portal/layout/PortalTabletNavigation.css` | Not Reviewed | Organized |
| 303 | `shivanyams/src/styles/organized/foundations/reset.css` | Not Reviewed | Organized |
| 304 | `shivanyams/src/styles/organized/foundations/tokens.css` | Not Reviewed | Organized |
| 305 | `shivanyams/src/styles/organized/foundations/typography.css` | Not Reviewed | Organized |
| 306 | `shivanyams/src/styles/organized/globals/.gitkeep` | Not Reviewed | Organized |
| 307 | `shivanyams/src/styles/organized/index.css` | Not Reviewed | Organized |
| 308 | `shivanyams/src/styles/organized/pages/.gitkeep` | Not Reviewed | Organized |
| 309 | `shivanyams/src/styles/organized/portal/.gitkeep` | Not Reviewed | Organized |
| 310 | `shivanyams/tsconfig.json` | Not Reviewed | Organized |

## Status definitions

- **Clean:** Inspected and no known cleanup work remains for the file's reviewed scope.
- **Cleanup Pending:** Inspected but known cleanup, migration, verification, or generated-file exception remains.
- **Not Reviewed:** No detailed cleanup audit has been completed yet.
- **Organized:** File is placed in the current organized project structure.
- **Legacy:** File is located in the explicitly retained legacy stylesheet tree and requires migration/review when in scope.

Update this register from the live Git tree after every file creation, deletion, move, or cleanup status change. Counts must reconcile exactly.
