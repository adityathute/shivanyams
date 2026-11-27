<!-- File Location: shivanyams/PROJECT_STRUCTURE.md -->
<!-- Reference Repositories: shivanya-sdk v1.0.0 (Master); shivanya-auth (private, version not verified) -->
<!-- Cleanup Status: Clean -->
<!-- Cleanup Info: Complete Git-tree inventory with per-file cleanup status and directory-based Legacy/Organized classification; generated and unreviewed files remain explicitly identified. -->

# ShivanyaMS V2 — Complete Project Structure

**Repository:** `adityathute/shivanyams`  
**Branch:** `shiv-v2`  
**Source snapshot:** `1da01707b79ca2ee2625148a30133cae38c71389`  
**Inventory rule:** Every tracked file in the source snapshot plus this inventory file itself is listed below. New or moved files must be added/updated in the next report refresh.

## Summary

| Metric | Count |
|---|---:|
| Total tracked files after this inventory update | 311 |
| Clean | 75 |
| Cleanup Pending | 119 |
| Not Reviewed | 117 |
| Organized | 75 |
| Legacy | 236 |
| Audited before this structure update | 194 |

**Classification note:** `Organized` means the file has been inspected, corrected and brought in line with current project standards; folder location alone does not determine this label. `Legacy` means older, incomplete, unmodernized or unmigrated code. `Not Reviewed` files remain provisionally `Legacy` until their audit. Cleanup Status and Structure Status are related but separately tracked.

**Generated-file exceptions:** `shivanyams/next-env.d.ts` is Cleanup Pending because Next.js marks it as generated; do not edit or add a custom header. Django migration files under `shivanyams/backend/apps/portal/migrations/` are generated historical schema records and must not receive manual formatting or metadata edits. The first two migrations were reviewed in Batch 15 and remain Cleanup Pending pending a dedicated migration-chain compatibility audit. The remaining Portal migration history is Not Reviewed and will be audited as a separate migration-chain task. Package manifests and image assets without safe inline metadata are tracked for dedicated dependency-sync and visual/optimization audits. Batch 18 introduced separate current and total cleanup metrics; both are refreshed after every batch.

## Complete tracked-file register

| # | Full repository-root path | Cleanup Status | Structure |
| 1 | `shivanyams/.env.local.example` | Clean | Organized |
| 2 | `shivanyams/.github/workflows/ci.yml` | Clean | Organized |
| 3 | `shivanyams/.gitignore` | Clean | Organized |
| 4 | `shivanyams/AGENTS.md` | Clean | Organized |
| 5 | `shivanyams/PROJECT_REPORTS.md` | Clean | Organized |
| 6 | `shivanyams/PROJECT_STRUCTURE.md` | Clean | Organized |
| 7 | `shivanyams/README.md` | Clean | Organized |
| 8 | `shivanyams/backend/.env.example` | Clean | Organized |
| 9 | `shivanyams/backend/.gitignore` | Clean | Organized |
| 10 | `shivanyams/backend/README.md` | Clean | Organized |
| 11 | `shivanyams/backend/apps/__init__.py` | Clean | Organized |
| 12 | `shivanyams/backend/apps/portal/__init__.py` | Clean | Organized |
| 13 | `shivanyams/backend/apps/portal/admin.py` | Cleanup Pending | Legacy |
| 14 | `shivanyams/backend/apps/portal/apps.py` | Clean | Organized |
| 15 | `shivanyams/backend/apps/portal/authentication.py` | Clean | Organized |
| 16 | `shivanyams/backend/apps/portal/comment_moderation.py` | Clean | Organized |
| 17 | `shivanyams/backend/apps/portal/data/__init__.py` | Clean | Organized |
| 18 | `shivanyams/backend/apps/portal/data/categories.py` | Clean | Organized |
| 19 | `shivanyams/backend/apps/portal/management/__init__.py` | Clean | Organized |
| 20 | `shivanyams/backend/apps/portal/management/commands/__init__.py` | Clean | Organized |
| 21 | `shivanyams/backend/apps/portal/management/commands/seed_portal_categories.py` | Clean | Organized |
| 22 | `shivanyams/backend/apps/portal/migrations/0001_initial.py` | Cleanup Pending | Legacy |
| 23 | `shivanyams/backend/apps/portal/migrations/0002_rename_description_category_description_en_and_more.py` | Cleanup Pending | Legacy |
| 24 | `shivanyams/backend/apps/portal/migrations/0003_importantlink.py` | Not Reviewed | Legacy |
| 25 | `shivanyams/backend/apps/portal/migrations/0004_job_advertisement_fields.py` | Not Reviewed | Legacy |
| 26 | `shivanyams/backend/apps/portal/migrations/0005_admitcarddetails_articleguidedetails_comment_and_more.py` | Not Reviewed | Legacy |
| 27 | `shivanyams/backend/apps/portal/migrations/0006_importantlink.py` | Not Reviewed | Legacy |
| 28 | `shivanyams/backend/apps/portal/migrations/0007_simplify_post_organization.py` | Not Reviewed | Legacy |
| 29 | `shivanyams/backend/apps/portal/migrations/0008_remove_post_portal_post_organiz_7ede86_idx_and_more.py` | Not Reviewed | Legacy |
| 30 | `shivanyams/backend/apps/portal/migrations/0009_postdate_date_format_postdate_end_date_and_more.py` | Not Reviewed | Legacy |
| 31 | `shivanyams/backend/apps/portal/migrations/0010_jobagerelaxation_jobdetails_age_as_on_date_and_more.py` | Not Reviewed | Legacy |
| 32 | `shivanyams/backend/apps/portal/migrations/0011_post_engagement_comments.py` | Not Reviewed | Legacy |
| 33 | `shivanyams/backend/apps/portal/migrations/0011_remove_jobagerelaxation_portal_joba_job_id_8cf78a_idx_and_more.py` | Not Reviewed | Legacy |
| 34 | `shivanyams/backend/apps/portal/migrations/0012_remove_jobdetails_fee_payment_mode_and_more.py` | Not Reviewed | Legacy |
| 35 | `shivanyams/backend/apps/portal/migrations/0013_postdate_month_years.py` | Not Reviewed | Legacy |
| 36 | `shivanyams/backend/apps/portal/migrations/0014_jobpost_jobpostfee_jobpost_unique_job_post_number_and_more.py` | Not Reviewed | Legacy |
| 37 | `shivanyams/backend/apps/portal/migrations/0015_make_common_job_age_optional.py` | Not Reviewed | Legacy |
| 38 | `shivanyams/backend/apps/portal/migrations/0016_jobdetails_shared_detail_modes.py` | Not Reviewed | Legacy |
| 39 | `shivanyams/backend/apps/portal/migrations/0017_jobposteducation.py` | Not Reviewed | Legacy |
| 40 | `shivanyams/backend/apps/portal/migrations/0018_postlink_action_texts.py` | Not Reviewed | Legacy |
| 41 | `shivanyams/backend/apps/portal/migrations/0019_postlink_group_key.py` | Not Reviewed | Legacy |
| 42 | `shivanyams/backend/apps/portal/migrations/0020_postfaq.py` | Not Reviewed | Legacy |
| 43 | `shivanyams/backend/apps/portal/migrations/0020_postversion_updated_at.py` | Not Reviewed | Legacy |
| 44 | `shivanyams/backend/apps/portal/migrations/0021_rename_portal_faq_post_act_idx_portal_post_post_id_16f132_idx_and_more.py` | Not Reviewed | Legacy |
| 45 | `shivanyams/backend/apps/portal/migrations/0022_website_analytics.py` | Not Reviewed | Legacy |
| 46 | `shivanyams/backend/apps/portal/migrations/0023_website_visitor_details.py` | Not Reviewed | Legacy |
| 47 | `shivanyams/backend/apps/portal/migrations/0024_rename_portal_post_visitor_04b834_idx_portal_web_visit_view_idx.py` | Not Reviewed | Legacy |
| 48 | `shivanyams/backend/apps/portal/migrations/0024_website_browser_analytics.py` | Not Reviewed | Legacy |
| 49 | `shivanyams/backend/apps/portal/migrations/0025_merge_20261120_2323.py` | Not Reviewed | Legacy |
| 50 | `shivanyams/backend/apps/portal/migrations/0026_newsletter_and_post_reports.py` | Not Reviewed | Legacy |
| 51 | `shivanyams/backend/apps/portal/migrations/0027_comment_author_profile.py` | Not Reviewed | Legacy |
| 52 | `shivanyams/backend/apps/portal/migrations/0028_merge_20261121.py` | Not Reviewed | Legacy |
| 53 | `shivanyams/backend/apps/portal/migrations/0029_allow_three_reports_per_user.py` | Not Reviewed | Legacy |
| 54 | `shivanyams/backend/apps/portal/migrations/0030_allow_legacy_jobpost_age_relaxations_null.py` | Not Reviewed | Legacy |
| 55 | `shivanyams/backend/apps/portal/migrations/0031_allow_legacy_jobpost_education_requirements_null.py` | Not Reviewed | Legacy |
| 56 | `shivanyams/backend/apps/portal/migrations/0032_remove_obsolete_jobpost_columns.py` | Not Reviewed | Legacy |
| 57 | `shivanyams/backend/apps/portal/migrations/0033_remove_all_obsolete_jobpost_columns.py` | Not Reviewed | Legacy |
| 58 | `shivanyams/backend/apps/portal/migrations/0034_remove_obsolete_jobpostfee_columns.py` | Not Reviewed | Legacy |
| 59 | `shivanyams/backend/apps/portal/migrations/0035_postversion.py` | Not Reviewed | Legacy |
| 60 | `shivanyams/backend/apps/portal/migrations/0036_remove_unused_job_salary_fields.py` | Not Reviewed | Legacy |
| 61 | `shivanyams/backend/apps/portal/migrations/0037_remove_legacy_job_salary_period.py` | Not Reviewed | Legacy |
| 62 | `shivanyams/backend/apps/portal/migrations/0038_remove_legacy_job_pay_scale.py` | Not Reviewed | Legacy |
| 63 | `shivanyams/backend/apps/portal/migrations/0039_remove_legacy_job_grade_pay.py` | Not Reviewed | Legacy |
| 64 | `shivanyams/backend/apps/portal/migrations/0040_remove_legacy_job_employment_terms.py` | Not Reviewed | Legacy |
| 65 | `shivanyams/backend/apps/portal/migrations/0041_cleanup_legacy_job_schema_drift.py` | Not Reviewed | Legacy |
| 66 | `shivanyams/backend/apps/portal/migrations/0042_global_newsletter_subscriptions.py` | Not Reviewed | Legacy |
| 67 | `shivanyams/backend/apps/portal/migrations/0043_merge_postversion_timestamp_and_newsletter.py` | Not Reviewed | Legacy |
| 68 | `shivanyams/backend/apps/portal/migrations/0044_postquestion.py` | Not Reviewed | Legacy |
| 69 | `shivanyams/backend/apps/portal/migrations/0045_postquestion_answer_visibility.py` | Not Reviewed | Legacy |
| 70 | `shivanyams/backend/apps/portal/migrations/0046_postquestion_answer_visibility_choices.py` | Not Reviewed | Legacy |
| 71 | `shivanyams/backend/apps/portal/migrations/0047_postquestion_helpful_vote.py` | Not Reviewed | Legacy |
| 72 | `shivanyams/backend/apps/portal/migrations/0048_unique_post_question_helpful_user.py` | Not Reviewed | Legacy |
| 73 | `shivanyams/backend/apps/portal/migrations/0049_postquestion_status.py` | Not Reviewed | Legacy |
| 74 | `shivanyams/backend/apps/portal/migrations/0050_tooldetails_tool_key_optional.py` | Not Reviewed | Legacy |
| 75 | `shivanyams/backend/apps/portal/migrations/__init__.py` | Not Reviewed | Legacy |
| 76 | `shivanyams/backend/apps/portal/models.py` | Cleanup Pending | Legacy |
| 77 | `shivanyams/backend/apps/portal/permissions.py` | Clean | Organized |
| 78 | `shivanyams/backend/apps/portal/serializers.py` | Cleanup Pending | Legacy |
| 79 | `shivanyams/backend/apps/portal/urls.py` | Cleanup Pending | Legacy |
| 80 | `shivanyams/backend/apps/portal/views.py` | Cleanup Pending | Legacy |
| 81 | `shivanyams/backend/config/__init__.py` | Clean | Organized |
| 82 | `shivanyams/backend/config/asgi.py` | Clean | Organized |
| 83 | `shivanyams/backend/config/settings.py` | Cleanup Pending | Legacy |
| 84 | `shivanyams/backend/config/urls.py` | Clean | Organized |
| 85 | `shivanyams/backend/config/wsgi.py` | Clean | Organized |
| 86 | `shivanyams/backend/manage.py` | Clean | Organized |
| 87 | `shivanyams/backend/requirements.txt` | Clean | Organized |
| 88 | `shivanyams/eslint.config.mjs` | Clean | Organized |
| 89 | `shivanyams/next-env.d.ts` | Cleanup Pending | Legacy |
| 90 | `shivanyams/next.config.ts` | Cleanup Pending | Legacy |
| 91 | `shivanyams/package-lock.json` | Not Reviewed | Legacy |
| 92 | `shivanyams/package.json` | Cleanup Pending | Legacy |
| 93 | `shivanyams/public/fonts/Hind-Bold.ttf` | Not Reviewed | Legacy |
| 94 | `shivanyams/public/fonts/Hind-Medium.ttf` | Not Reviewed | Legacy |
| 95 | `shivanyams/public/fonts/Hind-Regular.ttf` | Not Reviewed | Legacy |
| 96 | `shivanyams/public/fonts/Hind-SemiBold.ttf` | Not Reviewed | Legacy |
| 97 | `shivanyams/public/fonts/OFL-Hind.txt` | Clean | Organized |
| 98 | `shivanyams/public/images/404-img.png` | Cleanup Pending | Legacy |
| 99 | `shivanyams/public/images/admits-image007.png` | Cleanup Pending | Legacy |
| 100 | `shivanyams/public/images/exam-image.png` | Cleanup Pending | Legacy |
| 101 | `shivanyams/public/images/guides-image.png` | Cleanup Pending | Legacy |
| 102 | `shivanyams/public/images/jobs-image.png` | Cleanup Pending | Legacy |
| 103 | `shivanyams/public/images/result-image.png` | Not Reviewed | Legacy |
| 104 | `shivanyams/public/images/scheme-image.png` | Not Reviewed | Legacy |
| 105 | `shivanyams/public/images/tools-image.png` | Not Reviewed | Legacy |
| 106 | `shivanyams/public/images/videos-image.png` | Not Reviewed | Legacy |
| 107 | `shivanyams/public/logo.png` | Not Reviewed | Legacy |
| 108 | `shivanyams/public/shivanya-logo-light.png` | Not Reviewed | Legacy |
| 109 | `shivanyams/public/theme-init.js` | Clean | Organized |
| 110 | `shivanyams/src/app/about/page.tsx` | Clean | Organized |
| 111 | `shivanyams/src/app/admin/add-content/page.tsx` | Cleanup Pending | Legacy |
| 112 | `shivanyams/src/app/admin/add-post/page.tsx` | Clean | Organized |
| 113 | `shivanyams/src/app/admin/admin-utils.ts` | Clean | Organized |
| 114 | `shivanyams/src/app/admin/comments/page.tsx` | Cleanup Pending | Legacy |
| 115 | `shivanyams/src/app/admin/edit-post/[kind]/[slug]/page.tsx` | Clean | Organized |
| 116 | `shivanyams/src/app/admin/engagement/[postId]/page.tsx` | Cleanup Pending | Legacy |
| 117 | `shivanyams/src/app/admin/page.tsx` | Cleanup Pending | Legacy |
| 118 | `shivanyams/src/app/admin/preview/[kind]/[slug]/page.tsx` | Cleanup Pending | Legacy |
| 119 | `shivanyams/src/app/admin/questions/page.tsx` | Cleanup Pending | Legacy |
| 120 | `shivanyams/src/app/admin/reports/page.tsx` | Cleanup Pending | Legacy |
| 121 | `shivanyams/src/app/admin/tags/AdminTagsPage.tsx` | Cleanup Pending | Legacy |
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
| 137 | `shivanyams/src/app/layout.tsx` | Cleanup Pending | Legacy |
| 138 | `shivanyams/src/app/ledger/accounts/page.tsx` | Cleanup Pending | Legacy |
| 139 | `shivanyams/src/app/ledger/ledger.module.css` | Cleanup Pending | Legacy |
| 140 | `shivanyams/src/app/ledger/page.tsx` | Cleanup Pending | Legacy |
| 141 | `shivanyams/src/app/ledger/setup/page.tsx` | Cleanup Pending | Legacy |
| 142 | `shivanyams/src/app/ledger/transactions/page.tsx` | Cleanup Pending | Legacy |
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
| 157 | `shivanyams/src/components/admin/PostEditor.tsx` | Cleanup Pending | Legacy |
| 158 | `shivanyams/src/components/admitCard/AdmitCardsCharacters.tsx` | Cleanup Pending | Legacy |
| 159 | `shivanyams/src/components/admitCard/AdmitCardsPage.tsx` | Cleanup Pending | Legacy |
| 160 | `shivanyams/src/components/animation/BanyanTree/BanyanTree.tsx` | Cleanup Pending | Legacy |
| 161 | `shivanyams/src/components/animation/Birds/Birds.tsx` | Cleanup Pending | Legacy |
| 162 | `shivanyams/src/components/animation/Clock/PortalClock.tsx` | Cleanup Pending | Legacy |
| 163 | `shivanyams/src/components/animation/Clouds/Clouds.tsx` | Cleanup Pending | Legacy |
| 164 | `shivanyams/src/components/animation/GovernmentBuilding/GovernmentBuilding.tsx` | Cleanup Pending | Legacy |
| 165 | `shivanyams/src/components/animation/HillFlowers/HillFlowers.tsx` | Cleanup Pending | Legacy |
| 166 | `shivanyams/src/components/animation/LandscapeTerrain/LandscapeTerrain.tsx` | Cleanup Pending | Legacy |
| 167 | `shivanyams/src/components/animation/Moon/Moon.tsx` | Cleanup Pending | Legacy |
| 168 | `shivanyams/src/components/animation/Stars/Stars.tsx` | Cleanup Pending | Legacy |
| 169 | `shivanyams/src/components/animation/Sun/Sun.tsx` | Cleanup Pending | Legacy |
| 170 | `shivanyams/src/components/examination/ExaminationCharacters.tsx` | Cleanup Pending | Legacy |
| 171 | `shivanyams/src/components/examination/ExaminationPage.tsx` | Cleanup Pending | Legacy |
| 172 | `shivanyams/src/components/guide/GuidesCharacters.tsx` | Cleanup Pending | Legacy |
| 173 | `shivanyams/src/components/guide/GuidesPage.tsx` | Cleanup Pending | Legacy |
| 174 | `shivanyams/src/components/jobs/JobsCharacters.tsx` | Cleanup Pending | Legacy |
| 175 | `shivanyams/src/components/jobs/JobsPage.tsx` | Cleanup Pending | Legacy |
| 176 | `shivanyams/src/components/portal/RelatedJobsPage.tsx` | Cleanup Pending | Legacy |
| 177 | `shivanyams/src/components/portal/TagsPage.tsx` | Cleanup Pending | Legacy |
| 178 | `shivanyams/src/components/portal/category/CategoryGrid.tsx` | Cleanup Pending | Legacy |
| 179 | `shivanyams/src/components/portal/category/CategoryPage.tsx` | Cleanup Pending | Legacy |
| 180 | `shivanyams/src/components/portal/category/PortalEmptyState.tsx` | Clean | Organized |
| 181 | `shivanyams/src/components/portal/context/PortalAuthContext.tsx` | Clean | Organized |
| 182 | `shivanyams/src/components/portal/context/PortalLanguageContext.tsx` | Clean | Organized |
| 183 | `shivanyams/src/components/portal/data/portal-data.tsx` | Cleanup Pending | Legacy |
| 184 | `shivanyams/src/components/portal/home/HeroSection.tsx` | Cleanup Pending | Legacy |
| 185 | `shivanyams/src/components/portal/home/HomePage.tsx` | Cleanup Pending | Legacy |
| 186 | `shivanyams/src/components/portal/home/UpdatesSection.tsx` | Clean | Organized |
| 187 | `shivanyams/src/components/portal/language/LanguageDropdown.tsx` | Cleanup Pending | Legacy |
| 188 | `shivanyams/src/components/portal/layout/PortalLayout.tsx` | Cleanup Pending | Legacy |
| 189 | `shivanyams/src/components/portal/layout/footer/PortalFooter.tsx` | Cleanup Pending | Legacy |
| 190 | `shivanyams/src/components/portal/layout/footer/SiteMobileFooter.tsx` | Clean | Organized |
| 191 | `shivanyams/src/components/portal/layout/header/PortalHeader.tsx` | Cleanup Pending | Legacy |
| 192 | `shivanyams/src/components/portal/layout/header/PortalUserDropdown.tsx` | Cleanup Pending | Legacy |
| 193 | `shivanyams/src/components/portal/layout/sidebar/PortalSidebar.tsx` | Clean | Organized |
| 194 | `shivanyams/src/components/portal/post/NewsletterSubscribeButton.tsx` | Cleanup Pending | Legacy |
| 195 | `shivanyams/src/components/portal/post/PortalContentNotFound.tsx` | Clean | Organized |
| 196 | `shivanyams/src/components/portal/post/PortalPostDetail.tsx` | Cleanup Pending | Legacy |
| 197 | `shivanyams/src/components/portal/post/PostCommentsSection.tsx` | Cleanup Pending | Legacy |
| 198 | `shivanyams/src/components/portal/post/PostEngagementActions.tsx` | Cleanup Pending | Legacy |
| 199 | `shivanyams/src/components/portal/post/PostFAQSection.tsx` | Cleanup Pending | Legacy |
| 200 | `shivanyams/src/components/portal/post/comment-moderation.ts` | Clean | Organized |
| 201 | `shivanyams/src/components/portal/post/not-found-recommendations-config.ts` | Clean | Organized |
| 202 | `shivanyams/src/components/portal/post/post-sidebar-config.ts` | Clean | Organized |
| 203 | `shivanyams/src/components/portal/saved/SavedPostsPage.tsx` | Cleanup Pending | Legacy |
| 204 | `shivanyams/src/components/portal/utils/important-links-config.ts` | Clean | Organized |
| 205 | `shivanyams/src/components/portal/utils/job-deadline.ts` | Cleanup Pending | Legacy |
| 206 | `shivanyams/src/components/portal/utils/useImportantLinks.ts` | Cleanup Pending | Legacy |
| 207 | `shivanyams/src/components/results/ResultsCharacters.tsx` | Cleanup Pending | Legacy |
| 208 | `shivanyams/src/components/results/ResultsPage.tsx` | Cleanup Pending | Legacy |
| 209 | `shivanyams/src/components/scheme/SchemesCharacters.tsx` | Cleanup Pending | Legacy |
| 210 | `shivanyams/src/components/scheme/SchemesPage.tsx` | Cleanup Pending | Legacy |
| 211 | `shivanyams/src/components/static-pages/About/AboutPage.tsx` | Cleanup Pending | Legacy |
| 212 | `shivanyams/src/components/static-pages/Contact/ContactPage.tsx` | Cleanup Pending | Legacy |
| 213 | `shivanyams/src/components/static-pages/Disclaimer/DisclaimerPage.tsx` | Cleanup Pending | Legacy |
| 214 | `shivanyams/src/components/static-pages/Feedback/FeedbackPage.tsx` | Cleanup Pending | Legacy |
| 215 | `shivanyams/src/components/static-pages/Privacy/PrivacyPage.tsx` | Cleanup Pending | Legacy |
| 216 | `shivanyams/src/components/static-pages/Terms/TermsPage.tsx` | Cleanup Pending | Legacy |
| 217 | `shivanyams/src/components/tools/ToolsCharacters.tsx` | Cleanup Pending | Legacy |
| 218 | `shivanyams/src/components/tools/ToolsPage.tsx` | Cleanup Pending | Legacy |
| 219 | `shivanyams/src/components/videos/VideosCharacters.tsx` | Cleanup Pending | Legacy |
| 220 | `shivanyams/src/components/videos/VideosPage.tsx` | Cleanup Pending | Legacy |
| 221 | `shivanyams/src/components/videos/VideosSection.tsx` | Cleanup Pending | Legacy |
| 222 | `shivanyams/src/config/COMMENT-MODERATION.md` | Cleanup Pending | Legacy |
| 223 | `shivanyams/src/config/comment-moderation-words.json` | Cleanup Pending | Legacy |
| 224 | `shivanyams/src/data/portal/categories.ts` | Cleanup Pending | Legacy |
| 225 | `shivanyams/src/i18n/dictionaries/AboutPageDictionary.ts` | Cleanup Pending | Legacy |
| 226 | `shivanyams/src/i18n/dictionaries/ContactPageDictionary.ts` | Cleanup Pending | Legacy |
| 227 | `shivanyams/src/i18n/dictionaries/DisclaimerPageDictionary.ts` | Cleanup Pending | Legacy |
| 228 | `shivanyams/src/i18n/dictionaries/FeedbackPageDictionary.ts` | Cleanup Pending | Legacy |
| 229 | `shivanyams/src/i18n/dictionaries/PrivacyPageDictionary.ts` | Cleanup Pending | Legacy |
| 230 | `shivanyams/src/i18n/dictionaries/TermsPageDictionary.ts` | Cleanup Pending | Legacy |
| 231 | `shivanyams/src/i18n/dictionaries/base.ts` | Cleanup Pending | Legacy |
| 232 | `shivanyams/src/i18n/dictionaries/portal-dictionary.ts` | Cleanup Pending | Legacy |
| 233 | `shivanyams/src/i18n/organized/dictionaries/sidebar.ts` | Cleanup Pending | Legacy |
| 234 | `shivanyams/src/i18n/types.ts` | Clean | Organized |
| 235 | `shivanyams/src/lib/authenticated-fetch.ts` | Cleanup Pending | Legacy |
| 236 | `shivanyams/src/lib/format-number.ts` | Cleanup Pending | Legacy |
| 237 | `shivanyams/src/styles/css.config.ts` | Not Reviewed | Legacy |
| 238 | `shivanyams/src/styles/legacy/app/admin/add-post/AddPostPage.css` | Not Reviewed | Legacy |
| 239 | `shivanyams/src/styles/legacy/app/admin/admin.css` | Not Reviewed | Legacy |
| 240 | `shivanyams/src/styles/legacy/app/admin/comments/comments.css` | Not Reviewed | Legacy |
| 241 | `shivanyams/src/styles/legacy/app/admin/engagement/[postId]/engagement.css` | Not Reviewed | Legacy |
| 242 | `shivanyams/src/styles/legacy/app/admin/questions/questions.css` | Not Reviewed | Legacy |
| 243 | `shivanyams/src/styles/legacy/app/admin/reports/reports.css` | Not Reviewed | Legacy |
| 244 | `shivanyams/src/styles/legacy/app/admin/tags/tags.css` | Not Reviewed | Legacy |
| 245 | `shivanyams/src/styles/legacy/app/globals.css` | Not Reviewed | Legacy |
| 246 | `shivanyams/src/styles/legacy/app/portal-base.css` | Not Reviewed | Legacy |
| 247 | `shivanyams/src/styles/legacy/components/admin/PostEditor.css` | Not Reviewed | Legacy |
| 248 | `shivanyams/src/styles/legacy/components/admitCard/AdmitCardsCharacters.css` | Not Reviewed | Legacy |
| 249 | `shivanyams/src/styles/legacy/components/admitCard/AdmitCardsPage.css` | Not Reviewed | Legacy |
| 250 | `shivanyams/src/styles/legacy/components/animation/BanyanTree/BanyanTree.css` | Cleanup Pending | Legacy |
| 251 | `shivanyams/src/styles/legacy/components/animation/Clock/PortalClock.css` | Cleanup Pending | Legacy |
| 252 | `shivanyams/src/styles/legacy/components/animation/Clouds/Clouds.css` | Cleanup Pending | Legacy |
| 253 | `shivanyams/src/styles/legacy/components/animation/GovernmentBuilding/GovernmentBuilding.css` | Cleanup Pending | Legacy |
| 254 | `shivanyams/src/styles/legacy/components/animation/HillFlowers/HillFlowers.css` | Cleanup Pending | Legacy |
| 255 | `shivanyams/src/styles/legacy/components/animation/LandscapeTerrain/LandscapeTerrain.css` | Not Reviewed | Legacy |
| 256 | `shivanyams/src/styles/legacy/components/animation/Moon/Moon.css` | Not Reviewed | Legacy |
| 257 | `shivanyams/src/styles/legacy/components/animation/Stars/Stars.css` | Not Reviewed | Legacy |
| 258 | `shivanyams/src/styles/legacy/components/animation/Sun/Sun.css` | Not Reviewed | Legacy |
| 259 | `shivanyams/src/styles/legacy/components/examination/ExaminationCharacters.css` | Not Reviewed | Legacy |
| 260 | `shivanyams/src/styles/legacy/components/guide/GuidesCharacters.css` | Not Reviewed | Legacy |
| 261 | `shivanyams/src/styles/legacy/components/guide/GuidesPage.css` | Not Reviewed | Legacy |
| 262 | `shivanyams/src/styles/legacy/components/jobs/JobsCharacters.css` | Not Reviewed | Legacy |
| 263 | `shivanyams/src/styles/legacy/components/jobs/JobsPage.css` | Not Reviewed | Legacy |
| 264 | `shivanyams/src/styles/legacy/components/portal/RelatedJobsPage.css` | Not Reviewed | Legacy |
| 265 | `shivanyams/src/styles/legacy/components/portal/category/CategoryGrid.css` | Not Reviewed | Legacy |
| 266 | `shivanyams/src/styles/legacy/components/portal/category/CategoryPage.css` | Not Reviewed | Legacy |
| 267 | `shivanyams/src/styles/legacy/components/portal/home/HeroSection.css` | Not Reviewed | Legacy |
| 268 | `shivanyams/src/styles/legacy/components/portal/home/UpdatesSection.css` | Not Reviewed | Legacy |
| 269 | `shivanyams/src/styles/legacy/components/portal/language/LanguageDropdown.css` | Not Reviewed | Legacy |
| 270 | `shivanyams/src/styles/legacy/components/portal/layout/PortalShell.css` | Not Reviewed | Legacy |
| 271 | `shivanyams/src/styles/legacy/components/portal/layout/footer/SiteMobileFooter.css` | Not Reviewed | Legacy |
| 272 | `shivanyams/src/styles/legacy/components/portal/post/NewsletterSubscribeButton.css` | Cleanup Pending | Legacy |
| 273 | `shivanyams/src/styles/legacy/components/portal/post/PortalContentNotFound.css` | Cleanup Pending | Legacy |
| 274 | `shivanyams/src/styles/legacy/components/portal/post/PortalPostDetail.css` | Cleanup Pending | Legacy |
| 275 | `shivanyams/src/styles/legacy/components/portal/post/PostCommentsSection.css` | Cleanup Pending | Legacy |
| 276 | `shivanyams/src/styles/legacy/components/portal/post/PostEngagementActions.css` | Cleanup Pending | Legacy |
| 277 | `shivanyams/src/styles/legacy/components/portal/post/PostFAQSection.css` | Cleanup Pending | Legacy |
| 278 | `shivanyams/src/styles/legacy/components/portal/saved/SavedPostsPage.css` | Not Reviewed | Legacy |
| 279 | `shivanyams/src/styles/legacy/components/results/ResultsCharacters.css` | Not Reviewed | Legacy |
| 280 | `shivanyams/src/styles/legacy/components/results/ResultsPage.css` | Not Reviewed | Legacy |
| 281 | `shivanyams/src/styles/legacy/components/scheme/SchemesCharacters.css` | Not Reviewed | Legacy |
| 282 | `shivanyams/src/styles/legacy/components/scheme/SchemesPage.css` | Not Reviewed | Legacy |
| 283 | `shivanyams/src/styles/legacy/components/static-pages/About/AboutPage.css` | Not Reviewed | Legacy |
| 284 | `shivanyams/src/styles/legacy/components/static-pages/Contact/ContactPage.css` | Not Reviewed | Legacy |
| 285 | `shivanyams/src/styles/legacy/components/static-pages/Disclaimer/DisclaimerPage.css` | Not Reviewed | Legacy |
| 286 | `shivanyams/src/styles/legacy/components/static-pages/Feedback/FeedbackPage.css` | Not Reviewed | Legacy |
| 287 | `shivanyams/src/styles/legacy/components/static-pages/Privacy/PrivacyPage.css` | Not Reviewed | Legacy |
| 288 | `shivanyams/src/styles/legacy/components/static-pages/Terms/TermsPage.css` | Not Reviewed | Legacy |
| 289 | `shivanyams/src/styles/legacy/components/tools/ToolsCharacters.css` | Not Reviewed | Legacy |
| 290 | `shivanyams/src/styles/legacy/components/tools/ToolsPage.css` | Not Reviewed | Legacy |
| 291 | `shivanyams/src/styles/legacy/components/videos/VideosCharacters.css` | Not Reviewed | Legacy |
| 292 | `shivanyams/src/styles/legacy/components/videos/VideosPage.css` | Not Reviewed | Legacy |
| 293 | `shivanyams/src/styles/legacy/components/videos/VideosSection.css` | Not Reviewed | Legacy |
| 294 | `shivanyams/src/styles/organized/AI-GUIDE.md` | Not Reviewed | Legacy |
| 295 | `shivanyams/src/styles/organized/admin/.gitkeep` | Not Reviewed | Legacy |
| 296 | `shivanyams/src/styles/organized/components/.gitkeep` | Not Reviewed | Legacy |
| 297 | `shivanyams/src/styles/organized/components/portal/category/CategoryBadge.css` | Cleanup Pending | Legacy |
| 298 | `shivanyams/src/styles/organized/components/portal/category/CategoryGrid.css` | Cleanup Pending | Legacy |
| 299 | `shivanyams/src/styles/organized/components/portal/category/CategoryPageUpdates.css` | Cleanup Pending | Legacy |
| 300 | `shivanyams/src/styles/organized/components/portal/home/HomeResponsive.css` | Cleanup Pending | Legacy |
| 301 | `shivanyams/src/styles/organized/components/portal/home/LatestUpdatesTicker.css` | Cleanup Pending | Legacy |
| 302 | `shivanyams/src/styles/organized/components/portal/layout/PortalFooter.css` | Cleanup Pending | Legacy |
| 303 | `shivanyams/src/styles/organized/components/portal/layout/PortalTabletNavigation.css` | Cleanup Pending | Legacy |
| 304 | `shivanyams/src/styles/organized/foundations/reset.css` | Cleanup Pending | Legacy |
| 305 | `shivanyams/src/styles/organized/foundations/tokens.css` | Cleanup Pending | Legacy |
| 306 | `shivanyams/src/styles/organized/foundations/typography.css` | Cleanup Pending | Legacy |
| 307 | `shivanyams/src/styles/organized/globals/.gitkeep` | Not Reviewed | Legacy |
| 308 | `shivanyams/src/styles/organized/index.css` | Not Reviewed | Legacy |
| 309 | `shivanyams/src/styles/organized/pages/.gitkeep` | Not Reviewed | Legacy |
| 310 | `shivanyams/src/styles/organized/portal/.gitkeep` | Not Reviewed | Legacy |
| 311 | `shivanyams/tsconfig.json` | Not Reviewed | Legacy |

## Status definitions

- **Clean:** Inspected and no known cleanup work remains for the file's reviewed scope.
- **Cleanup Pending:** Inspected but known cleanup, migration, verification, or generated-file exception remains.
- **Not Reviewed:** No detailed cleanup audit has been completed yet.
- **Organized:** File has been inspected, corrected and brought in line with current project standards; folder location alone does not determine this label.
- **Legacy:** File is older, incomplete, unmodernized or unmigrated. Not Reviewed files remain provisionally Legacy until inspected.

Update this register from the live Git tree after every file creation, deletion, move, or cleanup status change. Counts must reconcile exactly.
