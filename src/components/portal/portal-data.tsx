"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type ItemType =
  | "job"
  | "scheme"
  | "examination"
  | "result"
  | "admit"
  | "guide"
  | "video";

export type Item = {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  link: string;
  type: ItemType;
};

export type Video = {
  id: string;
  title: string;
  url: string;
  thumbnail: string;
  language: string;
};

export type PortalData = {
  items: Item[];
  videos: Video[];
};

export const STORAGE_KEY = "shivanyams-portal-data";

export const initialData: PortalData = {
  items: [
    {
      id: "1",
      title: "MahaDBT 2.0 नवीन अपडेट – नोंदणी प्रक्रिया आणि महत्त्वाची माहिती",
      category: "योजना",
      date: "2026-10-22",
      description:
        "MahaDBT पोर्टलवरील नवीन अपडेट्स, अर्ज प्रक्रिया आणि आवश्यक कागदपत्रांची माहिती.",
      link: "https://mahadbt.maharashtra.gov.in/",
      type: "scheme",
    },
    {
      id: "2",
      title: "पोलीस भरती 2026 – पात्रता, वय आणि अर्ज प्रक्रिया",
      category: "नोकरी",
      date: "2026-10-21",
      description: "पोलीस भरतीसंबंधी अधिकृत जाहिरात आणि अर्जाची माहिती.",
      link: "https://www.mahapolice.gov.in/",
      type: "job",
    },
    {
      id: "3",
      title: "MPSC परीक्षा निकाल आणि अधिकृत सूचना",
      category: "निकाल",
      date: "2026-10-20",
      description: "निकाल आणि पुढील प्रक्रियेबाबत अधिकृत संकेतस्थळ तपासा.",
      link: "https://mpsc.gov.in/",
      type: "result",
    },
    {
      id: "4",
      title: "तलाठी भरती – प्रवेशपत्र आणि परीक्षा सूचना",
      category: "प्रवेशपत्र",
      date: "2026-10-19",
      description:
        "प्रवेशपत्र उपलब्धता आणि परीक्षेच्या सूचनांसाठी अधिकृत पोर्टल.",
      link: "https://mahabhumi.gov.in/",
      type: "admit",
    },
    {
      id: "5",
      title: "Aadhaar Card Download कसे करावे? | संपूर्ण माहिती",
      category: "मार्गदर्शक",
      date: "2026-10-18",
      description:
        "आधार कार्ड डाउनलोड करण्याची सोपी पद्धत आणि PDF पासवर्डबद्दल माहिती.",
      link: "https://myaadhaar.uidai.gov.in/",
      type: "guide",
    },
    {
      id: "6",
      title: "PM Kisan योजना – लाभार्थी स्थिती कशी तपासावी?",
      category: "योजना",
      date: "2026-10-17",
      description:
        "PM Kisan योजनेची माहिती आणि लाभार्थी स्थिती तपासण्याची पद्धत.",
      link: "https://pmkisan.gov.in/",
      type: "scheme",
    },
    {
      id: "7",
      title: "जिल्हा परिषद भरती – पदे आणि अर्जासंबंधी माहिती",
      category: "नोकरी",
      date: "2026-10-16",
      description: "जिल्हा परिषद भरतीच्या अधिकृत सूचना आणि अर्ज तपशील.",
      link: "https://www.maharashtra.gov.in/",
      type: "job",
    },
    {
      id: "8",
      title: "रेशन कार्ड e-KYC – प्रक्रिया आणि महत्त्वाची माहिती",
      category: "योजना",
      date: "2026-10-15",
      description: "रेशन कार्ड आणि e-KYC संदर्भात अधिकृत माहिती व सेवा.",
      link: "https://mahafood.gov.in/",
      type: "scheme",
    },
    {
      id: "9",
      title: "महाराष्ट्र वन विभाग भरती – नवीन जाहिरात",
      category: "नोकरी",
      date: "2026-10-14",
      description: "वन विभागातील पदे, पात्रता आणि भरती प्रक्रियेची माहिती.",
      link: "https://mahaforest.gov.in/",
      type: "job",
    },
    {
      id: "10",
      title: "महाराष्ट्र बोर्ड परीक्षा निकाल – ऑनलाइन कसा पाहावा?",
      category: "निकाल",
      date: "2026-10-13",
      description:
        "विद्यार्थ्यांसाठी बोर्ड परीक्षा निकाल पाहण्याची मार्गदर्शक माहिती.",
      link: "https://mahresult.nic.in/",
      type: "result",
    },
    {
      id: "11",
      title: "SSC परीक्षा प्रवेशपत्र डाउनलोड करण्याची पद्धत",
      category: "प्रवेशपत्र",
      date: "2026-10-12",
      description: "SSC परीक्षेसाठी प्रवेशपत्र आणि परीक्षा केंद्राची माहिती.",
      link: "https://ssc.gov.in/",
      type: "admit",
    },
    {
      id: "12",
      title: "PAN Card ऑनलाइन अर्ज कसा करावा?",
      category: "मार्गदर्शक",
      date: "2026-10-11",
      description: "PAN कार्ड अर्ज, आवश्यक कागदपत्रे आणि ऑनलाइन प्रक्रिया.",
      link: "https://www.onlineservices.nsdl.com/",
      type: "guide",
    },
    {
      id: "13",
      title: "प्रधानमंत्री आवास योजना – अर्ज आणि पात्रता",
      category: "योजना",
      date: "2026-10-10",
      description: "आवास योजनेची पात्रता, अर्ज प्रक्रिया आणि लाभांची माहिती.",
      link: "https://pmaymis.gov.in/",
      type: "scheme",
    },
    {
      id: "14",
      title: "महाराष्ट्र आरोग्य विभाग भरती – पात्रता आणि पदे",
      category: "नोकरी",
      date: "2026-10-09",
      description:
        "आरोग्य विभागातील विविध पदांसाठी पात्रता आणि भरतीविषयक माहिती.",
      link: "https://www.maharashtra.gov.in/",
      type: "job",
    },
    {
      id: "15",
      title: "ITI प्रवेश प्रक्रिया – ऑनलाइन अर्ज आणि कागदपत्रे",
      category: "प्रवेशपत्र",
      date: "2026-10-08",
      description:
        "ITI प्रवेशासाठी अर्ज प्रक्रिया आणि आवश्यक कागदपत्रांची माहिती.",
      link: "https://admission.dvet.gov.in/",
      type: "admit",
    },
    {
      id: "16",
      title: "महाराष्ट्र शिष्यवृत्ती परीक्षा – निकाल माहिती",
      category: "निकाल",
      date: "2026-10-07",
      description: "शिष्यवृत्ती परीक्षेचा निकाल आणि पुढील प्रक्रियेची माहिती.",
      link: "https://www.mscepuppss.in/",
      type: "result",
    },
    {
      id: "17",
      title: "Driving License ऑनलाइन कसे डाउनलोड करावे?",
      category: "मार्गदर्शक",
      date: "2026-10-06",
      description: "ड्रायव्हिंग लायसन्स डाउनलोड करण्याची ऑनलाइन पद्धत.",
      link: "https://parivahan.gov.in/",
      type: "guide",
    },
    {
      id: "18",
      title: "उज्ज्वला योजना – नवीन अर्ज आणि लाभ",
      category: "योजना",
      date: "2026-10-05",
      description: "उज्ज्वला योजनेची पात्रता आणि अर्ज प्रक्रियेची माहिती.",
      link: "https://www.pmuy.gov.in/",
      type: "scheme",
    },
    {
      id: "19",
      title: "रेल्वे भरती – अर्ज आणि परीक्षा तयारी",
      category: "नोकरी",
      date: "2026-10-04",
      description: "रेल्वे भरतीसंबंधी सूचना, पात्रता आणि परीक्षेची तयारी.",
      link: "https://www.rrbcdg.gov.in/",
      type: "job",
    },
    {
      id: "20",
      title: "DigiLocker खाते कसे तयार करावे?",
      category: "मार्गदर्शक",
      date: "2026-10-03",
      description:
        "DigiLocker नोंदणी, लॉगिन आणि डिजिटल कागदपत्रे मिळवण्याची पद्धत.",
      link: "https://www.digilocker.gov.in/",
      type: "guide",
    },
    {
      id: "21",
      title: "YouTube वर सरकारी योजनांची माहिती कशी शोधावी?",
      category: "व्हिडिओ",
      date: "2026-10-02",
      description:
        "सरकारी योजनांची अधिकृत माहिती शोधण्यासाठी सोपी व्हिडिओ मार्गदर्शिका.",
      link: "https://www.youtube.com/",
      type: "video",
    },
    {
      id: "22",
      title: "ऑनलाइन सरकारी फॉर्म कसा भरावा? | Step-by-Step",
      category: "व्हिडिओ",
      date: "2026-10-01",
      description: "ऑनलाइन अर्ज भरताना कोणती काळजी घ्यावी याची सोपी माहिती.",
      link: "https://www.youtube.com/",
      type: "video",
    },
    {
      id: "23",
      title: "महाराष्ट्र सरकारी नोकरी अपडेट्स – संपूर्ण मार्गदर्शन",
      category: "व्हिडिओ",
      date: "2026-09-30",
      description: "सरकारी नोकरीच्या जाहिराती आणि अपडेट्स कसे तपासावे.",
      link: "https://www.youtube.com/",
      type: "video",
    },
    {
      id: "24",
      title: "मोबाइलवरून सरकारी प्रमाणपत्र डाउनलोड कसे करावे?",
      category: "व्हिडिओ",
      date: "2026-09-29",
      description:
        "मोबाइल वापरून सरकारी प्रमाणपत्रे डाउनलोड करण्याची मार्गदर्शिका.",
      link: "https://www.youtube.com/",
      type: "video",
    },
    {
      id: "25",
      title: "मोबाइलवरून MahaDBT अर्ज कसा करावा?",
      category: "व्हिडिओ",
      date: "2026-09-28",
      description:
        "मोबाइलवर MahaDBT पोर्टल वापरून अर्ज भरण्याची सोपी प्रक्रिया.",
      link: "https://www.youtube.com/",
      type: "video",
    },
    {
      id: "26",
      title: "आधार कार्डला मोबाइल नंबर लिंक कसा करावा?",
      category: "व्हिडिओ",
      date: "2026-09-27",
      description:
        "आधार कार्डशी मोबाइल नंबर जोडण्याची प्रक्रिया आणि आवश्यक माहिती.",
      link: "https://www.youtube.com/",
      type: "video",
    },
    {
      id: "27",
      title: "सरकारी योजनांसाठी आवश्यक कागदपत्रे कोणती?",
      category: "व्हिडिओ",
      date: "2026-09-26",
      description:
        "सरकारी योजनांसाठी लागणारी महत्त्वाची कागदपत्रे आणि त्यांची माहिती.",
      link: "https://www.youtube.com/",
      type: "video",
    },
    {
      id: "28",
      title: "MPSC राज्यसेवा परीक्षा – अभ्यासक्रम आणि परीक्षा पद्धती",
      category: "परीक्षा",
      date: "2026-10-23",
      description:
        "MPSC राज्यसेवा परीक्षेचा अभ्यासक्रम, परीक्षा टप्पे आणि तयारीसाठी अधिकृत माहिती.",
      link: "https://mpsc.gov.in/",
      type: "examination",
    },
    {
      id: "29",
      title: "महाराष्ट्र बोर्ड परीक्षा – वेळापत्रक आणि परीक्षेच्या सूचना",
      category: "परीक्षा",
      date: "2026-10-24",
      description:
        "SSC आणि HSC परीक्षांचे वेळापत्रक व सूचनांसाठी महाराष्ट्र बोर्डाचे अधिकृत संकेतस्थळ तपासा.",
      link: "https://mahahsscboard.in/",
      type: "examination",
    },
    {
      id: "30",
      title: "UPSC परीक्षा – पात्रता, परीक्षा टप्पे आणि अभ्यासक्रम",
      category: "परीक्षा",
      date: "2026-10-25",
      description:
        "UPSC नागरी सेवा परीक्षेची पात्रता, परीक्षा पद्धती आणि अभ्यासक्रमाची माहिती.",
      link: "https://upsc.gov.in/",
      type: "examination",
    },
    {
      id: "31",
      title: "NEET UG परीक्षा – अर्ज आणि परीक्षा मार्गदर्शक",
      category: "परीक्षा",
      date: "2026-10-26",
      description:
        "NEET UG परीक्षेसाठी अर्ज, पात्रता आणि अधिकृत परीक्षा सूचना.",
      link: "https://neet.nta.nic.in/",
      type: "examination",
    },
    {
      id: "32",
      title: "JEE Main परीक्षा – माहिती आणि तयारीचे मार्गदर्शन",
      category: "परीक्षा",
      date: "2026-10-27",
      description:
        "JEE Main परीक्षेची माहिती, अर्ज प्रक्रिया आणि अधिकृत सूचना.",
      link: "https://jeemain.nta.nic.in/",
      type: "examination",
    },
    {
      id: "33",
      title: "सरकारी स्पर्धा परीक्षांसाठी मॉक टेस्ट आणि सराव",
      category: "परीक्षा",
      date: "2026-10-28",
      description:
        "स्पर्धा परीक्षांच्या तयारीसाठी नमुना प्रश्नपत्रिका, सराव आणि मॉक टेस्टची माहिती.",
      link: "https://www.mpsc.gov.in/",
      type: "examination",
    },
  ],
  videos: [
    {
      id: "v1",
      title: "Aadhaar Card Download कसे करावे? | संपूर्ण माहिती",
      url: "https://www.youtube.com/watch?v=YOUR_VIDEO_ID",
      thumbnail:
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=700&q=80",
      language: "मराठी",
    },
    {
      id: "v2",
      title: "MahaDBT 2.0 नवीन अपडेट | संपूर्ण माहिती",
      url: "",
      thumbnail:
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=700&q=80",
      language: "मराठी",
    },
    {
      id: "v3",
      title: "महत्त्वाच्या Online Services घरबसल्या कशा करायच्या",
      url: "",
      thumbnail:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80",
      language: "मराठी",
    },
    {
      id: "v4",
      title: "PM Kisan योजना | लाभार्थी माहिती",
      url: "",
      thumbnail:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=700&q=80",
      language: "मराठी",
    },
  ],
};

type PortalDataContextValue = {
  data: PortalData;
};

const PortalDataContext = createContext<PortalDataContextValue | null>(null);

function readPortalData(): PortalData {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as PortalData;
  } catch {
    return initialData;
  }
  return initialData;
}

export function PortalDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortalData>(initialData);

  useEffect(() => {
    setData(readPortalData());

    const update = () => setData(readPortalData());

    window.addEventListener("storage", update);
    window.addEventListener("shivanyams-content-updated", update);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("shivanyams-content-updated", update);
    };
  }, []);

  return (
    <PortalDataContext.Provider value={{ data }}>
      {children}
    </PortalDataContext.Provider>
  );
}

export function usePortalData() {
  const context = useContext(PortalDataContext);
  if (!context) {
    throw new Error("usePortalData must be used inside PortalDataProvider");
  }
  return context;
}
