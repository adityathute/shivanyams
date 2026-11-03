import { Typography } from "shivanya-ui";
import { PortalFooter } from "./portal/PortalFooter";
import "./ContactPage.css";
import "./AboutPage.css";

export function AboutPage() {
  return (
    <>
      <main className="contact-page about-page">
        {/* Hero */}
        <section className="about-hero">
          <div className="about-hero-content">
            <span className="about-eyebrow">ABOUT SHIVANYAMS</span>

            <Typography as="h1" variant="h1" className="about-title">
              Information that helps you move forward.
            </Typography>

            <p className="about-hero-description">
              ShivanyaMS is an independent information platform helping people
              discover government jobs, schemes, results, admit cards, and
              important updates in one place.
            </p>

            <div className="about-hero-actions">
              <a href="/" className="about-primary-button">
                Explore ShivanyaMS <span>→</span>
              </a>

              <a href="/contact" className="about-secondary-button">
                Contact us
              </a>
            </div>
          </div>

          <div className="about-hero-visual">
            <div className="about-visual-card">
              <img
                src="/logo.png"
                alt="ShivanyaMS Logo"
                className="about-visual-logo"
              />

              <span className="about-visual-label">SHIVANYAMS</span>

              <h2>Your information companion</h2>

              <p>Jobs, schemes, and updates made easier to understand.</p>

              <div className="about-visual-footer">
                <span className="about-visual-dot" />
                Information made accessible
              </div>
            </div>
            <div className="about-floating-badge">
              <span>✦</span> Simple. Useful. Accessible.
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="about-intro">
          <div className="about-section-heading">
            <span className="about-eyebrow">WHO WE ARE</span>
            <h2>About ShivanyaMS</h2>
          </div>

          <p>
            ShivanyaMS is designed to make important information easier to find
            and understand. We bring together updates related to government
            employment, public schemes, examinations, and other useful
            opportunities.
          </p>

          <p>
            Our goal is to help users save time by presenting information in a
            simple, organized, and accessible format. We believe useful
            information should be easy for everyone to explore.
          </p>
        </section>

        {/* Founder */}
        <section className="about-founder">
          <div className="about-founder-content">
            <span className="about-eyebrow">OUR FOUNDER</span>

            <h2>Meet the Founder</h2>

            <h3>Aditya Thute</h3>

            <span className="about-founder-role">Full Stack Developer</span>

            <p>
              ShivanyaMS was founded by Aditya Thute, a Full Stack Developer, in
              2026. The platform was created with the goal of making government
              jobs, schemes, results, admit cards, and important updates easily
              accessible to everyone.
            </p>

            <p>
              Our mission is to simplify information and help users stay
              informed about opportunities that matter.
            </p>
          </div>

          <div className="about-founder-badge">
            <img src="/logo.png" alt="ShivanyaMS" />
            <span>Built with a vision</span>
            <strong>Making information accessible.</strong>
          </div>
        </section>

        {/* Features */}
        <section className="about-services">
          <div className="about-section-heading">
            <span className="about-eyebrow">WHAT YOU CAN FIND</span>
            <h2>Everything important, in one place.</h2>
            <p>Explore different sections of ShivanyaMS to stay informed.</p>
          </div>

          <div className="about-feature-grid">
            <article className="about-feature-card">
              <div className="about-feature-icon about-icon-blue">
                <span>💼</span>
              </div>
              <h3>Government Jobs</h3>
              <p>
                Explore recruitment notifications, eligibility details, and
                application-related updates.
              </p>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-icon about-icon-purple">
                <span>🏛️</span>
              </div>
              <h3>Government Schemes</h3>
              <p>
                Find information about government schemes, benefits, and related
                announcements.
              </p>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-icon about-icon-green">
                <span>📋</span>
              </div>
              <h3>Results & Admit Cards</h3>
              <p>
                Stay informed about examination results, hall tickets, and
                important recruitment updates.
              </p>
            </article>

            <article className="about-feature-card">
              <div className="about-feature-icon about-icon-orange">
                <span>📚</span>
              </div>
              <h3>Guides & Information</h3>
              <p>
                Read useful guides and information to help understand
                application and examination processes.
              </p>
            </article>
          </div>
        </section>

        {/* Mission */}
        <section className="about-mission">
          <div className="about-mission-mark">✦</div>

          <div>
            <span className="about-eyebrow">OUR MISSION</span>

            <h2>Making useful information simple and accessible.</h2>

            <p>
              We aim to help people discover opportunities and understand
              important updates without unnecessary confusion. Our focus is on
              clarity, accessibility, and continuous improvement.
            </p>
          </div>
        </section>

        {/* Trust */}
        <section className="about-trust">
          <div className="about-section-heading">
            <span className="about-eyebrow">OUR COMMITMENT</span>
            <h2>Information you can approach with confidence.</h2>
          </div>

          <div className="about-trust-grid">
            <div className="about-trust-item">
              <span className="about-trust-check">✓</span>
              <div>
                <h3>Clear Information</h3>
                <p>
                  We aim to present information in a simple, readable, and
                  organized way.
                </p>
              </div>
            </div>

            <div className="about-trust-item">
              <span className="about-trust-check">✓</span>
              <div>
                <h3>Official Source Awareness</h3>
                <p>
                  We encourage users to verify important details through
                  official websites and notifications.
                </p>
              </div>
            </div>

            <div className="about-trust-item">
              <span className="about-trust-check">✓</span>
              <div>
                <h3>Continuous Improvement</h3>
                <p>
                  Feedback helps us improve the platform and make it more useful
                  for everyone.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Independent platform notice */}
        <section className="about-disclaimer">
          <span className="about-disclaimer-icon">ⓘ</span>

          <div>
            <h3>Important information</h3>
            <p>
              ShivanyaMS is an independent information platform. It is not an
              official government website and is not affiliated with any
              government department or authority. Always check the original
              official notification before applying for a job or scheme.
            </p>

            <a href="/disclaimer">
              Read our Disclaimer <span>→</span>
            </a>
          </div>
        </section>

        {/* CTA */}
        <section className="about-cta">
          <div>
            <span className="about-eyebrow">WE VALUE YOUR FEEDBACK</span>
            <h2>Help us make ShivanyaMS better.</h2>
            <p>
              Have a suggestion, question, or idea? We would love to hear from
              you.
            </p>
          </div>

          <div className="about-cta-actions">
            <a href="/feedback" className="about-primary-button">
              Share Feedback <span>→</span>
            </a>

            <a href="/contact" className="about-secondary-button">
              Contact Us
            </a>
          </div>
        </section>
      </main>

      <PortalFooter />
    </>
  );
}
