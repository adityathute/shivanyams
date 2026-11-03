import { Typography } from "shivanya-ui";
import { PortalFooter } from "./portal/PortalFooter";
import "./ContactPage.css";
import "./PrivacyPage.css";

export function PrivacyPage() {
  return (
    <>
      <main className="contact-page document-page privacy-page">
        <div className="document-page-header">
          <div>
            <Typography
              as="h1"
              variant="h1"
              className="document-page-title"
            >
              Privacy Policy
            </Typography>

            <Typography className="document-page-description">
              Learn how ShivanyaMS handles your information and privacy.
            </Typography>
          </div>
        </div>

        <article className="document-content">
          <span className="contact-card-label">PRIVACY & DATA</span>

          <h2>Privacy Policy</h2>

          <div className="privacy-updated">
            Last updated: 3 November 2026
          </div>

          <p>
            Welcome to <strong>ShivanyaMS</strong>. Your privacy is important
            to us. This Privacy Policy explains how information may be
            collected, used, and protected when you visit or use our website.
          </p>

          <h3>1. About ShivanyaMS</h3>

          <p>
            ShivanyaMS is an independent information platform providing
            updates related to government jobs, recruitment notifications,
            government schemes, admit cards, results, and other useful
            information.
          </p>

          <h3>2. Information We May Collect</h3>

          <p>
            Depending on how you use our website, we may collect the
            following information:
          </p>

          <ul className="privacy-list">
            <li>
              Information you voluntarily provide, such as your name,
              email address, or feedback.
            </li>
            <li>
              Basic technical information, such as browser type,
              device information, and pages visited.
            </li>
            <li>
              Usage information that helps us understand and improve
              website performance.
            </li>
          </ul>

          <p>
            Please do not submit passwords, financial information, or
            other sensitive personal information through our contact
            or feedback forms.
          </p>

          <h3>3. How We Use Information</h3>

          <p>Information may be used to:</p>

          <ul className="privacy-list">
            <li>Respond to your questions and feedback.</li>
            <li>Improve website content and user experience.</li>
            <li>Maintain website functionality and security.</li>
            <li>Understand how visitors use our website.</li>
          </ul>

          <h3>4. Cookies and Similar Technologies</h3>

          <p>
            ShivanyaMS may use cookies or similar technologies to support
            website functionality, remember preferences, or understand
            website usage.
          </p>

          <p>
            You can manage or disable cookies through your browser
            settings. Some website features may not work properly
            if cookies are disabled.
          </p>

          <h3>5. Third-Party Services</h3>

          <p>
            Our website may use third-party services for analytics,
            advertising, or other functionality. These services may
            collect information according to their own privacy policies.
          </p>

          <p>
            ShivanyaMS does not control the privacy practices of
            third-party websites or services. Please review their
            privacy policies before using them.
          </p>

          <h3>6. External Links</h3>

          <p>
            Our website may contain links to government websites and
            other external websites. We are not responsible for their
            content, security, or privacy practices.
          </p>

          <h3>7. Information Sharing</h3>

          <p>
            We do not sell personal information submitted through our
            website. Information may be shared when necessary to operate
            the website, comply with applicable laws, or protect the
            security and rights of ShivanyaMS and its users.
          </p>

          <h3>8. Data Security</h3>

          <p>
            We take reasonable steps to protect information from
            unauthorized access, misuse, or disclosure. However,
            no method of internet transmission or electronic storage
            can be guaranteed to be completely secure.
          </p>

          <h3>9. Children's Privacy</h3>

          <p>
            ShivanyaMS is an informational website. We do not knowingly
            collect personal information from children unless permitted
            by applicable law and with appropriate consent where required.
          </p>

          <h3>10. Changes to This Privacy Policy</h3>

          <p>
            We may update this Privacy Policy from time to time.
            Any changes will be published on this page along with
            an updated date.
          </p>

          <h3>11. Contact Us</h3>

          <p>
            If you have any questions about this Privacy Policy or
            your information, please contact us.
          </p>

          <div className="privacy-contact">
            <span className="privacy-contact-icon">✉</span>

            <div>
              <strong>ShivanyaMS</strong>
              <a href="mailto:hello@shivanyams.com">
                hello@shivanyams.com
              </a>
            </div>
          </div>

          <div className="document-notice">
            <p>
              <strong>Your privacy matters.</strong> Please contact us
              if you have concerns about information submitted through
              ShivanyaMS.
            </p>
          </div>
        </article>
      </main>

      <PortalFooter />
    </>
  );
}