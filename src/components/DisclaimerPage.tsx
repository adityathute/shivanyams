import { Typography } from "shivanya-ui";
import { PortalFooter } from "./portal/PortalFooter";
import "./ContactPage.css";
import "./DisclaimerPage.css";

export function DisclaimerPage() {
  return (
    <>
      <main className="contact-page disclaimer-page">
        <div className="contact-page-header">
          <div>
            <Typography
              as="h1"
              variant="h1"
              className="contact-page-title"
            >
              Disclaimer
            </Typography>

            <Typography className="contact-page-description">
              Important information about using ShivanyaMS.
            </Typography>
          </div>

          <div className="contact-header-badge">
            <span className="contact-status-dot" />
            Important information
          </div>
        </div>

        <div className="disclaimer-content">
          <section className="disclaimer-card">
            <span className="contact-card-label">अस्वीकरण</span>
            <h2>महत्त्वाची सूचना</h2>

            <p>
              ShivanyaMS हे एक स्वतंत्र माहिती पोर्टल आहे. या वेबसाइटवर
              शासकीय नोकरी, योजना आणि इतर महत्त्वाची माहिती सोप्या
              स्वरूपात उपलब्ध करून दिली जाते.
            </p>

            <p>
              ShivanyaMS चा कोणत्याही शासकीय संस्था, विभाग, मंडळ किंवा
              सरकारी यंत्रणेशी अधिकृत संबंध नाही. आम्ही कोणत्याही भरती
              प्रक्रियेत सहभागी नाही आणि नोकरीसाठी कोणतेही शुल्क आकारत नाही.
            </p>

            <p>
              येथे दिलेली माहिती उपलब्ध सार्वजनिक आणि अधिकृत स्रोतांच्या
              आधारे सादर करण्याचा प्रयत्न केला जातो. तरीही माहितीमध्ये
              बदल, त्रुटी किंवा विलंब होऊ शकतो.
            </p>

            <p>
              कोणत्याही नोकरीसाठी किंवा योजनेसाठी अर्ज करण्यापूर्वी
              संबंधित अधिकृत वेबसाइटवरील मूळ जाहिरात आणि नियम
              काळजीपूर्वक तपासावेत.
            </p>

            <p>
              ShivanyaMS वरील माहितीच्या आधारे घेतलेल्या निर्णयामुळे
              होणाऱ्या कोणत्याही नुकसानासाठी आम्ही जबाबदार राहणार नाही.
            </p>
          </section>

          <section className="disclaimer-card">
            <span className="contact-card-label">DISCLAIMER</span>
            <h2>About ShivanyaMS</h2>

            <p>
              ShivanyaMS is an independent information platform that
              provides information about government jobs, schemes, and
              related updates in a simple and accessible format.
            </p>

            <p>
              ShivanyaMS is not affiliated with, endorsed by, or officially
              connected to any government department, agency, board, or
              organization. We do not conduct recruitment or charge
              applicants any application or recruitment fees.
            </p>

            <p>
              We try to provide information based on publicly available
              and official sources. However, information may change,
              contain errors, or become outdated.
            </p>

            <p>
              Users must verify all details, eligibility criteria, dates,
              fees, and instructions on the official website or original
              notification before applying or taking any action.
            </p>

            <p>
              ShivanyaMS shall not be responsible for any loss, damage,
              or inconvenience arising from the use of information
              published on this website.
            </p>

            <p>
              All logos, names, and trademarks belong to their respective
              owners. Their use does not imply any affiliation or
              endorsement.
            </p>
          </section>

          <section className="disclaimer-notice">
            <span className="disclaimer-notice-icon">⚠️</span>

            <div>
              <h2>सावधगिरी बाळगा</h2>
              <p>
                कोणत्याही व्यक्तीला नोकरी किंवा सरकारी योजना मिळवून
                देण्यासाठी पैसे देऊ नका. अधिकृत माहिती तपासा आणि
                फसवणुकीपासून सावध रहा.
              </p>
            </div>
          </section>

          <section className="disclaimer-card disclaimer-last">
            <span className="contact-card-label">CONTACT</span>
            <h2>Questions or corrections?</h2>

            <p>
              If you notice incorrect information or have any questions,
              please contact us.
            </p>

            <a href="/contact" className="disclaimer-contact-link">
              Contact ShivanyaMS <span>→</span>
            </a>
          </section>
        </div>
      </main>

      <PortalFooter />
    </>
  );
}