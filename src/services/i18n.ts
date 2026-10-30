import { SupportedLanguage } from './speechService';

export interface TranslationDictionary {
  // Brand & Header
  appTitle: string;
  tagline: string;
  loginRequired: string;
  profileBadge: string;
  logoutOrEdit: string;
  
  // Navigation Tabs
  tabBuses: string;
  tabLiveMap: string;
  tabBusyTimes: string;
  tabGpsTracker: string;
  tabETM: string;
  tabReports: string;
  tabEvaluatorDB: string;
  backButton: string;
  customerLocationLabel: string;
  detectLocationBtn: string;
  freeSeats: string;
  occupiedSeats: string;

  // Login / Welcome Screen
  loginHeading: string;
  loginSubheading: string;
  labelName: string;
  placeholderName: string;
  labelAge: string;
  labelGender: string;
  genderMale: string;
  genderFemale: string;
  genderOther: string;
  labelSpecialPerson: string;
  specialNone: string;
  specialWheelchair: string;
  specialElderly: string;
  specialMobility: string;
  specialVision: string;
  loginSubmitBtn: string;
  loginBenefitNotice: string;

  // Search Card (RedBus style)
  searchTitle: string;
  labelFrom: string;
  labelTo: string;
  labelDate: string;
  labelTime: string;
  btnSearchBuses: string;
  quickSwap: string;
  filterAll: string;
  filterLowestRisk: string;
  filterStepFree: string;
  filterSeatsAvailable: string;

  // Bus Listing
  busesFound: (count: number) => string;
  departure: string;
  arrival: string;
  duration: string;
  riskScoreLabel: string;
  lowerIsSafer: string;
  seatsLeft: (count: number) => string;
  crowdPlenty: string;
  crowdFew: string;
  crowdStanding: string;
  crowdSevere: string;
  stepFreeVerified: string;
  barrierAlert: string;
  btnViewSeats: string;
  btnBookNow: string;
  btnListenVoice: string;
  btnRiskDetails: string;

  // Seat Selection
  seatSelectTitle: string;
  seatSelectSub: string;
  driverCabin: string;
  seatAvailable: string;
  seatReserved: string;
  seatSpecialAccessible: string;
  seatSelected: string;
  totalFare: string;
  btnConfirmSeat: string;

  // ETM Handheld Machine & Showcase Database
  etmTitle: string;
  etmSubtitle: string;
  etmMachineId: string;
  etmRouteLabel: string;
  etmPassengerType: string;
  etmPrintTicket: string;
  etmTicketPrinted: string;
  etmDatabaseTitle: string;
  etmTotalTickets: string;
  etmTotalRevenue: string;
  etmSpecialPassengers: string;
  etmVerifyQR: string;
  etmResetDB: string;

  // Quick Action Modals
  scanStopQR: string;
  reportIssue: string;
  backtestEvaluation: string;
  aiAdvisor: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appTitle: 'TRANSITSHIELD BUS',
    tagline: 'Smart & Accessible Public Transportation · RedBus Green Edition',
    loginRequired: 'Passenger Details Required',
    profileBadge: 'Passenger Profile',
    logoutOrEdit: 'Edit Profile',

    tabBuses: 'Find Buses',
    tabLiveMap: 'Live Risk Map',
    tabBusyTimes: 'Busy Times',
    tabGpsTracker: 'Live GPS Fleet',
    tabETM: 'Conductor ETM Machine',
    tabReports: 'Community Alerts',
    tabEvaluatorDB: 'Evaluators DB Showcase',
    backButton: 'Back',
    customerLocationLabel: 'Your Location',
    detectLocationBtn: 'Detect GPS',
    freeSeats: 'Free Seats',
    occupiedSeats: 'Booked',

    loginHeading: 'Welcome to TransitShield',
    loginSubheading: 'Enter commuter information for personalized accessibility and risk-aware bus routing.',
    labelName: 'Full Name',
    placeholderName: 'e.g. Ramesh Kumar',
    labelAge: 'Age',
    labelGender: 'Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    labelSpecialPerson: 'Special Needs / Accessibility Category',
    specialNone: 'None (Standard Commuter)',
    specialWheelchair: 'Wheelchair User (Mandatory Step-Free)',
    specialElderly: 'Senior Citizen (Seating Priority)',
    specialMobility: 'Reduced Mobility / Walking Difficulty',
    specialVision: 'Visually Impaired / Tactile Guidance',
    loginSubmitBtn: 'Continue to Search Buses',
    loginBenefitNotice: 'Special person status automatically enables fare concessions, wheelchair bay reservation, and step-free routing.',

    searchTitle: 'Search Safe & Accessible Buses',
    labelFrom: 'From Stop / Location',
    labelTo: 'To Destination',
    labelDate: 'Date of Journey',
    labelTime: 'Preferred Departure',
    btnSearchBuses: 'SEARCH BUSES',
    quickSwap: 'Swap',
    filterAll: 'All Buses',
    filterLowestRisk: 'Safest (Lowest Risk)',
    filterStepFree: 'Step-Free Only',
    filterSeatsAvailable: 'Guaranteed Seats',

    busesFound: (c) => `${c} Safe Buses Available on this Corridor`,
    departure: 'Departs',
    arrival: 'Arrives',
    duration: 'Duration',
    riskScoreLabel: 'Journey Risk Score',
    lowerIsSafer: 'Lower is safer (0 - 100)',
    seatsLeft: (c) => `${c} Seats Available`,
    crowdPlenty: 'Plenty of Seats',
    crowdFew: 'Few Seats Left',
    crowdStanding: 'Standing Only',
    crowdSevere: 'Severely Crowded',
    stepFreeVerified: 'Step-Free Low Floor',
    barrierAlert: 'Physical Barrier / High Steps',
    btnViewSeats: 'Select Seats',
    btnBookNow: 'Instant ETM Book',
    btnListenVoice: 'Voice Guidance',
    btnRiskDetails: 'Risk Breakdown',

    seatSelectTitle: 'Select Passenger Seat',
    seatSelectSub: 'Green buses feature dedicated low-floor accessibility bays and senior priority seats.',
    driverCabin: 'DRIVER CABIN',
    seatAvailable: 'Available',
    seatReserved: 'Booked',
    seatSpecialAccessible: 'Accessible / Wheelchair Bay',
    seatSelected: 'Your Seat',
    totalFare: 'Total Fare Amount',
    btnConfirmSeat: 'Confirm & Issue ETM Ticket',

    etmTitle: 'Electronic Ticketing Machine (ETM)',
    etmSubtitle: 'Handheld Smart Conductor Terminal & Live Ticketing Database for Evaluator Showcase',
    etmMachineId: 'ETM Terminal ID: BMTC-ETM-908',
    etmRouteLabel: 'Active Transit Route',
    etmPassengerType: 'Passenger Category',
    etmPrintTicket: 'ISSUE & PRINT TICKET',
    etmTicketPrinted: 'Ticket Printed Successfully on Thermal Roll!',
    etmDatabaseTitle: 'Evaluators Database: Issued Tickets & Live Manifest',
    etmTotalTickets: 'Total Tickets Issued',
    etmTotalRevenue: 'Collection Revenue',
    etmSpecialPassengers: 'Special Category Riders',
    etmVerifyQR: 'Verify Ticket QR Hash',
    etmResetDB: 'Reset Demo Database',

    scanStopQR: 'Stop QR Scan',
    reportIssue: 'Report Barrier',
    backtestEvaluation: 'Back-Test Evaluation (Slide 7)',
    aiAdvisor: 'Transit AI Advisor',
  },

  hi: {
    appTitle: 'ट्रांजिट शील्ड बस',
    tagline: 'स्मार्ट और सुगम सार्वजनिक परिवहन · रेडबस ग्रीन संस्करण',
    loginRequired: 'यात्री विवरण आवश्यक है',
    profileBadge: 'यात्री प्रोफ़ाइल',
    logoutOrEdit: 'प्रोफ़ाइल बदलें',

    tabBuses: 'बसें खोजें',
    tabLiveMap: 'लाइव जोखिम नक्शा',
    tabBusyTimes: 'व्यस्त समय',
    tabGpsTracker: 'लाइव जीपीएस फ्लीट',
    tabETM: 'कंडक्टर ईटीएम मशीन',
    tabReports: 'कम्युनिटी अलर्ट',
    tabEvaluatorDB: 'मूल्यांकनकर्ता डेटाबेस',
    backButton: 'पीछे जाएं',
    customerLocationLabel: 'आपका स्थान',
    detectLocationBtn: 'जीपीएस खोजें',
    freeSeats: 'उपलब्ध सीटें',
    occupiedSeats: 'आरक्षित',

    loginHeading: 'ट्रांजिट शील्ड में आपका स्वागत है',
    loginSubheading: 'सुलभ और जोखिम-मुक्त यात्रा के लिए अपना विवरण दर्ज करें।',
    labelName: 'पूरा नाम',
    placeholderName: 'उदा. रमेश कुमार',
    labelAge: 'उम्र',
    labelGender: 'लिंग',
    genderMale: 'पुरुष',
    genderFemale: 'महिला',
    genderOther: 'अन्य',
    labelSpecialPerson: 'विशेष आवश्यकताएं / दिव्यांगता श्रेणी',
    specialNone: 'कोई नहीं (सामान्य यात्री)',
    specialWheelchair: 'व्हीलचेयर उपयोगकर्ता (बाधा-मुक्त अनिवार्य)',
    specialElderly: 'वरिष्ठ नागरिक (बैठने की प्राथमिकता)',
    specialMobility: 'चलने-फिरने में कठिनाई',
    specialVision: 'दृष्टिबाधित / स्पर्श मार्गदर्शन',
    loginSubmitBtn: 'बसें खोजने के लिए आगे बढ़ें',
    loginBenefitNotice: 'विशेष व्यक्ति स्थिति से किराया छूट, व्हीलचेयर बे आरक्षण और लो-फ्लोर बस की सिफारिश मिलती है।',

    searchTitle: 'सुरक्षित और सुलभ बसें खोजें',
    labelFrom: 'प्रारंभिक स्टॉप',
    labelTo: 'गंतव्य स्टॉप',
    labelDate: 'यात्रा की तारीख',
    labelTime: 'प्रस्थान समय',
    btnSearchBuses: 'बसें खोजें',
    quickSwap: 'अदला-बदली',
    filterAll: 'सभी बसें',
    filterLowestRisk: 'सबसे सुरक्षित (न्यूनतम जोखिम)',
    filterStepFree: 'केवल बाधा-मुक्त',
    filterSeatsAvailable: 'सीटें उपलब्ध',

    busesFound: (c) => `इस मार्ग पर ${c} सुरक्षित बसें उपलब्ध हैं`,
    departure: 'प्रस्थान',
    arrival: 'पहुंच',
    duration: 'यात्रा समय',
    riskScoreLabel: 'यात्रा जोखिम स्कोर',
    lowerIsSafer: 'कम स्कोर अधिक सुरक्षित (0 - 100)',
    seatsLeft: (c) => `${c} सीटें उपलब्ध`,
    crowdPlenty: 'पर्याप्त सीटें उपलब्ध',
    crowdFew: 'कुछ ही सीटें बची हैं',
    crowdStanding: 'केवल खड़े रहने की जगह',
    crowdSevere: 'अत्यधिक भीड़',
    stepFreeVerified: 'बाधा-मुक्त लो-फ्लोर बस',
    barrierAlert: 'सीढ़ियां / भौतिक बाधा',
    btnViewSeats: 'सीट चुनें',
    btnBookNow: 'ईटीएम टिकट बनाएं',
    btnListenVoice: 'ध्वनि मार्गदर्शन',
    btnRiskDetails: 'जोखिम विवरण',

    seatSelectTitle: 'यात्री सीट चुनें',
    seatSelectSub: 'ग्रीन बसों में विशेष व्हीलचेयर बे और वरिष्ठ नागरिकों के लिए आरक्षित सीटें उपलब्ध हैं।',
    driverCabin: 'ड्राइवर केबिन',
    seatAvailable: 'उपलब्ध',
    seatReserved: 'बुक की गई',
    seatSpecialAccessible: 'सुगम / व्हीलचेयर बे',
    seatSelected: 'आपकी सीट',
    totalFare: 'कुल किराया राशि',
    btnConfirmSeat: 'पुष्टि करें और टिकट प्रिंट करें',

    etmTitle: 'इलेक्ट्रॉनिक टिकटिंग मशीन (ईटीएम)',
    etmSubtitle: 'मूल्यांकनकर्ताओं के प्रदर्शन के लिए हैंडहेल्ड स्मार्ट कंडक्टर मशीन और लाइव डेटाबेस',
    etmMachineId: 'ईटीएम टर्मिनल: BMTC-ETM-908',
    etmRouteLabel: 'सक्रिय बस मार्ग',
    etmPassengerType: 'यात्री श्रेणी',
    etmPrintTicket: 'टिकट जारी करें और प्रिंट करें',
    etmTicketPrinted: 'थर्मल रोल पर टिकट सफलतापूर्वक प्रिंट हो गया!',
    etmDatabaseTitle: 'मूल्यांकनकर्ता डेटाबेस: जारी टिकट और यात्री सूची',
    etmTotalTickets: 'कुल जारी टिकट',
    etmTotalRevenue: 'कुल राजस्व संग्रह',
    etmSpecialPassengers: 'विशेष श्रेणी यात्री',
    etmVerifyQR: 'टिकट क्यूआर कोड सत्यापित करें',
    etmResetDB: 'डेमो डेटाबेस रीसेट करें',

    scanStopQR: 'स्टॉप क्यूआर स्कैन',
    reportIssue: 'बाधा रिपोर्ट करें',
    backtestEvaluation: 'बैक-टेस्ट मूल्यांकन (स्लाइड 7)',
    aiAdvisor: 'ट्रांजिट एआई सलाहकार',
  },

  kn: {
    appTitle: 'ಟ್ರಾನ್ಸಿಟ್‌ಶೀಲ್ಡ್ ಬಸ್',
    tagline: 'ಸ್ಮಾರ್ಟ್ ಮತ್ತು ಸುಲಭ ಸಾರ್ವಜನಿಕ ಸಾರಿಗೆ · ರೆಡ್‌ಬಸ್ ಗ್ರೀನ್ ಆವೃತ್ತಿ',
    loginRequired: 'ಪ್ರಯಾಣಿಕರ ವಿವರಗಳು ಅಗತ್ಯವಿದೆ',
    profileBadge: 'ಪ್ರಯಾಣಿಕರ ವಿವರ',
    logoutOrEdit: 'ವಿವರ ಬದಲಾಯಿಸಿ',

    tabBuses: 'ಬಸ್‌ಗಳನ್ನು ಹುಡುಕಿ',
    tabLiveMap: 'ಲೈವ್ ರಿಸ್ಕ್ ನಕ್ಷೆ',
    tabBusyTimes: 'ರಶ್ ಅವರ್ ಸಮಯ',
    tabGpsTracker: 'ಲೈವ್ ಜಿಪಿಎಸ್ ಫ್ಲೀಟ್',
    tabETM: 'ಕಂಡಕ್ಟರ್ ಇಟಿಎಂ ಯಂತ್ರ',
    tabReports: 'ಸಮುದಾಯ ವರದಿಗಳು',
    tabEvaluatorDB: 'ಮೌಲ್ಯಮಾಪಕರ ಡೇಟಾಬೇಸ್',
    backButton: 'ಹಿಂದೆ',
    customerLocationLabel: 'ನಿಮ್ಮ ಪ್ರಸ್ತುತ ಸ್ಥಳ',
    detectLocationBtn: 'ಜಿಪಿಎಸ್ ಗುರುತಿಸಿ',
    freeSeats: 'ಉಚಿತ ಆಸನಗಳು',
    occupiedSeats: 'ಕಾಯ್ದಿರಿಸಿದ ಆಸನಗಳು',

    loginHeading: 'ಟ್ರಾನ್ಸಿಟ್‌ಶೀಲ್ಡ್‌ಗೆ ಸ್ವಾಗತ',
    loginSubheading: 'ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಸುಗಮ ಮತ್ತು ಕಡಿಮೆ ಅಪಾಯದ ಪ್ರಯಾಣಕ್ಕಾಗಿ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
    labelName: 'ಪೂರ್ಣ ಹೆಸರು',
    placeholderName: 'ಉದಾ: ರಮೇಶ್ ಕುಮಾರ್',
    labelAge: 'ವಯಸ್ಸು',
    labelGender: 'ಲಿಂಗ',
    genderMale: 'ಪುರುಷ',
    genderFemale: 'ಮಹಿಳೆ',
    genderOther: 'ಇತರ',
    labelSpecialPerson: 'ವಿಶೇಷ ಅಗತ್ಯಗಳು / ಅಂಗವಿಕಲತೆ ವರ್ಗ',
    specialNone: 'ಯಾವುದೂ ಇಲ್ಲ (ಸಾಮಾನ್ಯ ಪ್ರಯಾಣಿಕ)',
    specialWheelchair: 'ವ್ಹೀಲ್‌ಚೇರ್ ಬಳಕೆದಾರ (ಮೆಟ್ಟಿಲು ರಹಿತ ಕಡ್ಡಾಯ)',
    specialElderly: 'ಹಿರಿಯ ನಾಗರಿಕ (ಆಸನ ಆದ್ಯತೆ)',
    specialMobility: 'ಕಡಿಮೆ ಚಲನಶೀಲತೆ / ನಡೆಯಲು ತೊಂದರೆ',
    specialVision: 'ದೃಷ್ಟಿ ದೋಷ / ಸ್ಪರ್ಶ ಮಾರ್ಗದರ್ಶನ',
    loginSubmitBtn: 'ಬಸ್ ಹುಡುಕಾಟಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ',
    loginBenefitNotice: 'ವಿಶೇಷ ವ್ಯಕ್ತಿ ವರ್ಗವು ರಿಯಾಯಿತಿ ದರ, ವ್ಹೀಲ್‌ಚೇರ್ ಜಾಗ ಕಾಯ್ದಿರಿಸುವಿಕೆ ಮತ್ತು ಲೋ-ಫ್ಲೋರ್ ಬಸ್‌ಗಳನ್ನು ಒದಗಿಸುತ್ತದೆ.',

    searchTitle: 'ಸುರಕ್ಷಿತ ಮತ್ತು ಸುಲಭ ಬಸ್‌ಗಳನ್ನು ಹುಡುಕಿ',
    labelFrom: 'ಪ್ರಾರಂಭಿಕ ನಿಲ್ದಾಣ',
    labelTo: 'ತಲುಪುವ ನಿಲ್ದಾಣ',
    labelDate: 'ಪ್ರಯಾಣದ ದಿನಾಂಕ',
    labelTime: 'ಹೊರಡುವ ಸಮಯ',
    btnSearchBuses: 'ಬಸ್ ಹುಡುಕಿ',
    quickSwap: 'ಅದಲುಬದಲು',
    filterAll: 'ಎಲ್ಲಾ ಬಸ್‌ಗಳು',
    filterLowestRisk: 'ಅತ್ಯಂತ ಸುರಕ್ಷಿತ (ಕಡಿಮೆ ಅಪಾಯ)',
    filterStepFree: 'ಮೆಟ್ಟಿಲು ರಹಿತ ಮಾತ್ರ',
    filterSeatsAvailable: 'ಖಾತರಿ ಆಸನಗಳು',

    busesFound: (c) => `ಈ ಮಾರ್ಗದಲ್ಲಿ ${c} ಸುರಕ್ಷಿತ ಬಸ್‌ಗಳು ಲಭ್ಯವಿವೆ`,
    departure: 'ಹೊರಡುವಿಕೆ',
    arrival: 'ತಲುಪುವಿಕೆ',
    duration: 'ಪ್ರಯಾಣದ ಸಮಯ',
    riskScoreLabel: 'ಪ್ರಯಾಣ ಅಪಾಯದ ಅಂಕ',
    lowerIsSafer: 'ಕಡಿಮೆ ಅಂಕವೇ ಸುರಕ್ಷಿತ (0 - 100)',
    seatsLeft: (c) => `${c} ಆಸನಗಳು ಲಭ್ಯವಿವೆ`,
    crowdPlenty: 'ಸಾಕಷ್ಟು ಆಸನಗಳು ಲಭ್ಯವಿವೆ',
    crowdFew: 'ಕೆಲವೇ ಆಸನಗಳು ಉಳಿದಿವೆ',
    crowdStanding: 'ಕೇವಲ ನಿಲ್ಲಲು ಮಾತ್ರ ಸ್ಥಳ',
    crowdSevere: 'ವಿಪರೀತ ಜನದಟ್ಟಣೆ',
    stepFreeVerified: 'ಮೆಟ್ಟಿಲು ರಹಿತ ಲೋ-ಫ್ಲೋರ್ ಬಸ್',
    barrierAlert: 'ಅಡೆತಡೆ / ಎತ್ತರದ ಮೆಟ್ಟಿಲುಗಳು',
    btnViewSeats: 'ಆಸನ ಆಯ್ಕೆಮಾಡಿ',
    btnBookNow: 'ಇಟಿಎಂ ಟಿಕೆಟ್ ಪಡೆಯಿರಿ',
    btnListenVoice: 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ',
    btnRiskDetails: 'ಅಪಾಯದ ವಿವರ',

    seatSelectTitle: 'ಪ್ರಯಾಣಿಕರ ಆಸನ ಆಯ್ಕೆಮಾಡಿ',
    seatSelectSub: 'ಗ್ರೀನ್ ಬಸ್‌ಗಳಲ್ಲಿ ವ್ಹೀಲ್‌ಚೇರ್ ಮತ್ತು ಹಿರಿಯ ನಾಗರಿಕರಿಗೆ ಮೀಸಲಾದ ಆಸನಗಳಿವೆ.',
    driverCabin: 'ಚಾಲಕರ ಕ್ಯಾಬಿನ್',
    seatAvailable: 'ಲಭ್ಯವಿದೆ',
    seatReserved: 'ಬುಕ್ ಮಾಡಲಾಗಿದೆ',
    seatSpecialAccessible: 'ಸುಲಭ ಪ್ರವೇಶ / ವ್ಹೀಲ್‌ಚೇರ್ ಜಾಗ',
    seatSelected: 'ನಿಮ್ಮ ಆಸನ',
    totalFare: 'ಒಟ್ಟು ಪ್ರಯಾಣ ದರ',
    btnConfirmSeat: 'ದೃಢೀಕರಿಸಿ ಮತ್ತು ಇಟಿಎಂ ಟಿಕೆಟ್ ಮುದ್ರಿಸಿ',

    etmTitle: 'ಎಲೆಕ್ಟ್ರಾನಿಕ್ ಟಿಕೆಟಿಂಗ್ ಯಂತ್ರ (ಇಟಿಎಂ)',
    etmSubtitle: 'ಮೌಲ್ಯಮಾಪಕರ ಪ್ರದರ್ಶನಕ್ಕಾಗಿ ಹ್ಯಾಂಡ್‌ಹೆಲ್ಡ್ ಸ್ಮಾರ್ಟ್ ಕಂಡಕ್ಟರ್ ಯಂತ್ರ ಮತ್ತು ಲೈವ್ ಡೇಟಾಬೇಸ್',
    etmMachineId: 'ಇಟಿಎಂ ಯಂತ್ರ ಸಂಖ್ಯೆ: BMTC-ETM-908',
    etmRouteLabel: 'ಪ್ರಸ್ತುತ ಬಸ್ ಮಾರ್ಗ',
    etmPassengerType: 'ಪ್ರಯಾಣಿಕರ ವರ್ಗ',
    etmPrintTicket: 'ಟಿಕೆಟ್ ನೀಡಿ ಮತ್ತು ಮುದ್ರಿಸಿ',
    etmTicketPrinted: 'ಥರ್ಮಲ್ ರೋಲ್‌ನಲ್ಲಿ ಟಿಕೆಟ್ ಯಶಸ್ವಿಯಾಗಿ ಮುದ್ರಿಸಲಾಗಿದೆ!',
    etmDatabaseTitle: 'ಮೌಲ್ಯಮಾಪಕರ ಡೇಟಾಬೇಸ್: ನೀಡಲಾದ ಟಿಕೆಟ್‌ಗಳು ಮತ್ತು ಪಟ್ಟಿ',
    etmTotalTickets: 'ಒಟ್ಟು ನೀಡಲಾದ ಟಿಕೆಟ್‌ಗಳು',
    etmTotalRevenue: 'ಒಟ್ಟು ಆದಾಯ ಸಂಗ್ರಹ',
    etmSpecialPassengers: 'ವಿಶೇಷ ವರ್ಗದ ಪ್ರಯಾಣಿಕರು',
    etmVerifyQR: 'ಟಿಕೆಟ್ ಕ್ಯೂಆರ್ ಕೋಡ್ ಪರಿಶೀಲಿಸಿ',
    etmResetDB: 'ಡೆಮೊ ಡೇಟಾಬೇಸ್ ಮರುಹೊಂದಿಸಿ',

    scanStopQR: 'ಸ್ಟಾಪ್ ಕ್ಯೂಆರ್ ಸ್ಕ್ಯಾನ್',
    reportIssue: 'ಅಡಚಣೆ ವರದಿ ಮಾಡಿ',
    backtestEvaluation: 'ಬ್ಯಾಕ್‌-ಟೆಸ್ಟ್ ಮೌಲ್ಯಮಾಪನ (ಸ್ಲೈಡ್ 7)',
    aiAdvisor: 'ಟ್ರಾನ್ಸಿಟ್ ಎಐ ಸಲಹೆಗಾರ',
  },
};
