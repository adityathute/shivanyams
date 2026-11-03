import { Typography } from "shivanya-ui";
import { PortalFooter } from "./portal/PortalFooter";
import "./ContactPage.css";
import "./TermsPage.css";

export function TermsPage() {
  return (
    <>
      <main className="contact-page document-page terms-page">
        <div className="document-page-header">
          <Typography
            as="h1"
            variant="h1"
            className="document-page-title"
          >
            Terms of Use
          </Typography>

          <Typography className="document-page-description">
            Please read these terms before using ShivanyaMS.
          </Typography>
        </div>

        <section className="document-content">
          <span className="contact-card-label">TERMS & CONDITIONS</span>

          <h2>Terms of Use</h2>

          <p className="terms-updated">
            <strong>Last updated:</strong> 3 November 2026
          </p>

          <p>
            Welcome to <strong>ShivanyaMS</strong>. By accessing or using
            this website, you agree to follow these Terms of Use. If you
            do not agree with these terms, please discontinue using the
            website.
          </p>

          <div className="document-divider" />

          <h3>1. About ShivanyaMS</h3>
          <p>
            ShivanyaMS is an independent information platform providing
            updates related to government jobs, recruitment notifications,
            government schemes, admit cards, results, and other useful
            information. We are not an official government website and
            are not affiliated with any government department or authority.
          </p>

          <h3>2. Use of Content</h3>
          <p>
            All content published on ShivanyaMS is provided for general
            informational purposes.
          </p>
          <ul className="terms-list">
            <li>You may access and read content for personal use.</li>
            <li>
              Copying, republishing, or redistributing our content without
              permission is not allowed.
            </li>
            <li>
              We do not guarantee that all information is complete,
              accurate, or up to date.
            </li>
          </ul>

          <h3>3. Information and Official Sources</h3>
          <p>
            Information may be collected from official government websites,
            recruitment boards, notifications, and public announcements.
            Users should verify all details with the relevant official
            authority before applying or taking action.
          </p>

          <h3>4. No Guarantee of Recruitment or Selection</h3>
          <p>
            ShivanyaMS does not guarantee job selection, examination
            results, recruitment outcomes, or eligibility. All decisions
            are made by the relevant recruitment authorities.
          </p>

          <h3>5. External Links</h3>
          <p>
            Our website may contain links to third-party websites,
            including government portals. We do not control these websites
            and are not responsible for their content, accuracy,
            availability, or policies. Users visit external websites
            at their own discretion.
          </p>

          <h3>6. Advertisements</h3>
          <p>
            ShivanyaMS may display advertisements or third-party
            promotional content. Advertisements do not necessarily
            represent our endorsement. We are not responsible for
            advertiser products, services, or claims.
          </p>

          <h3>7. Limitation of Liability</h3>
          <p>
            ShivanyaMS shall not be liable for any loss, damage, or
            inconvenience resulting from:
          </p>
          <ul className="terms-list">
            <li>Reliance on information published on this website.</li>
            <li>Errors, omissions, or delays in information.</li>
            <li>Website downtime or technical interruptions.</li>
            <li>Content or services provided by third-party websites.</li>
          </ul>

          <h3>8. Changes to Content and Services</h3>
          <p>
            We reserve the right to modify, update, or remove website
            content and services at any time without prior notice.
            We may also update these Terms of Use. Continued use of
            ShivanyaMS after changes means you accept the updated terms.
          </p>

          <h3>9. User Conduct</h3>
          <p>Users agree not to:</p>
          <ul className="terms-list">
            <li>Use the website for unlawful purposes.</li>
            <li>Attempt to disrupt or damage website functionality.</li>
            <li>Misuse, scrape, or copy website content without permission.</li>
            <li>Attempt unauthorized access to website systems or data.</li>
          </ul>

          <h3>10. Privacy</h3>
          <p>
            Your use of ShivanyaMS is also subject to our{" "}
            <a href="/privacy">Privacy Policy</a>, which explains how
            information may be collected and used.
          </p>

          <h3>11. Governing Law</h3>
          <p>
            These Terms of Use shall be governed and interpreted in
            accordance with the applicable laws of India.
          </p>

          <h3>12. Contact Information</h3>
          <p>
            If you have questions about these Terms of Use, please
            contact us:
          </p>

          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:hello@shivanyams.com">
              hello@shivanyams.com
            </a>
            <br />
            <strong>Website:</strong>{" "}
            <a href="https://shivanyams.com">shivanyams.com</a>
          </p>

          <div className="document-notice">
            <p>
              <strong>Important:</strong> Please verify important
              information through official sources before applying for
              jobs or government schemes.
            </p>
          </div>
        </section>
      </main>

      <PortalFooter />
    </>
  );
}