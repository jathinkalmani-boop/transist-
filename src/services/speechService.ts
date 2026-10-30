export type SupportedLanguage = 'en' | 'hi' | 'kn';

export interface VoiceStrings {
  languageName: string;
  nativeName: string;
  greeting: string;
  arrivingIn: (mins: number, uncertainty: number) => string;
  crowdingPlenty: string;
  crowdingFew: string;
  crowdingStanding: string;
  crowdingSevere: string;
  stepFreeAccessible: string;
  barrierWarning: string;
  safestChoice: (route: string, score: number) => string;
  riskNotice: (score: number) => string;
}

export const LOCALIZED_VOICE_GUIDANCE: Record<SupportedLanguage, VoiceStrings> = {
  en: {
    languageName: 'English',
    nativeName: 'English',
    greeting: 'Welcome to TransitShield. Here is your personalized journey recommendation.',
    arrivingIn: (m, u) => `Arriving in approximately ${m} minutes, plus or minus ${u} minutes uncertainty.`,
    crowdingPlenty: 'Seating is plentiful. Comfortable boarding expected.',
    crowdingFew: 'Few seats remaining. Boarding promptly recommended.',
    crowdingStanding: 'Standing room only. Expect high passenger load.',
    crowdingSevere: 'Severely overcrowded. Consider waiting for the following low-risk service.',
    stepFreeAccessible: 'Full step-free access verified with ramp and low-floor entrance.',
    barrierWarning: 'Caution: accessibility barriers or broken elevator reported along this path.',
    safestChoice: (r, s) => `Recommended safe option is ${r} with a Journey Risk Score of ${s}.`,
    riskNotice: (s) => `Journey Risk Score is ${s} out of 100. Lower is safer.`,
  },
  hi: {
    languageName: 'Hindi',
    nativeName: 'हिन्दी',
    greeting: 'ट्रांजिट शील्ड में आपका स्वागत है। यह आपकी यात्रा की सुरक्षित सिफारिश है।',
    arrivingIn: (m, u) => `बस लगभग ${m} मिनट में आ रही है, संभावित अंतर लगभग ${u} मिनट है।`,
    crowdingPlenty: 'पर्याप्त सीटें उपलब्ध हैं। आरामदायक यात्रा की उम्मीद है।',
    crowdingFew: 'कुछ ही सीटें बची हैं। समय पर सवार हों।',
    crowdingStanding: 'केवल खड़े रहने की जगह है। भीड़ अधिक रहेगी।',
    crowdingSevere: 'बस अत्यधिक भरी हुई है। कृपया अगली कम जोखिम वाली बस लें।',
    stepFreeAccessible: 'रैंप और लो-फ्लोर के साथ बाधा-मुक्त और सुलभ मार्ग।',
    barrierWarning: 'सावधान: इस मार्ग पर लिफ्ट खराब या रास्ता बाधित है।',
    safestChoice: (r, s) => `सबसे सुरक्षित विकल्प ${r} है, जिसका जोखिम स्कोर मात्र ${s} है।`,
    riskNotice: (s) => `यात्रा जोखिम स्कोर 100 में से ${s} है। कम स्कोर अधिक सुरक्षित है।`,
  },
  kn: {
    languageName: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    greeting: 'ಟ್ರಾನ್ಸಿಟ್‌ಶೀಲ್ಡ್‌ಗೆ ಸ್ವಾಗತ. ನಿಮ್ಮ ಸುರಕ್ಷಿತ ಪ್ರಯಾಣದ ಶಿಫಾರಸು ಇಲ್ಲಿದೆ.',
    arrivingIn: (m, u) => `ಬಸ್ ಸರಿಸುಮಾರು ${m} ನಿಮಿಷಗಳಲ್ಲಿ ಬರಲಿದೆ, ವ್ಯತ್ಯಾಸ ಸುಮಾರು ${u} ನಿಮಿಷಗಳು.`,
    crowdingPlenty: 'ಸಾಕಷ್ಟು ಆಸನಗಳು ಲಭ್ಯವಿವೆ. ಆರಾಮದಾಯಕ ಪ್ರಯಾಣ ನಿರೀಕ್ಷಿಸಿ.',
    crowdingFew: 'ಕೆಲವೇ ಆಸನಗಳು ಉಳಿದಿವೆ. ಬೇಗ ಹತ್ತಲು ಸೂಚಿಸಲಾಗಿದೆ.',
    crowdingStanding: 'ಕೇವಲ ನಿಲ್ಲಲು ಮಾತ್ರ ಸ್ಥಳವಿದೆ. ಪ್ರಯಾಣಿಕರ ದಟ್ಟಣೆ ಹೆಚ್ಚಾಗಿದೆ.',
    crowdingSevere: 'ಬಸ್‌ನಲ್ಲಿ ವಿಪರೀತ ಜನದಟ್ಟಣೆ ಇದೆ. ದಯವಿಟ್ಟು ಮುಂದಿನ ಸುರಕ್ಷಿತ ಬಸ್‌ಗಾಗಿ ಕಾಯಿರಿ.',
    stepFreeAccessible: 'ಮೆಟ್ಟಿಲು ರಹಿತ, ರ‍್ಯಾಂಪ್ ಮತ್ತು ಲೋ-ಫ್ಲೋರ್ ಪ್ರವೇಶ ದೃಢೀಕರಿಸಲಾಗಿದೆ.',
    barrierWarning: 'ಎಚ್ಚರಿಕೆ: ಈ ಮಾರ್ಗದಲ್ಲಿ ಅಡಚಣೆ ಅಥವಾ ಲಿಫ್ಟ್ ದುರಸ್ತಿ ವರದಿಯಾಗಿದೆ.',
    safestChoice: (r, s) => `ಅತ್ಯಂತ ಸುರಕ್ಷಿತ ಆಯ್ಕೆ ${r}, ಇದರ ಪ್ರಯಾಣ ಅಪಾಯದ ಅಂಕ ${s} ಆಗಿದೆ.`,
    riskNotice: (s) => `ಪ್ರಯಾಣ ಅಪಾಯದ ಅಂಕ 100 ರಲ್ಲಿ ${s} ಆಗಿದೆ. ಕಡಿಮೆ ಅಂಕವೇ ಹೆಚ್ಚು ಸುರಕ್ಷಿತ.`,
  },
};

export class TransitVoiceSynthesizer {
  private static isSpeaking = false;

  public static speak(text: string, lang: SupportedLanguage = 'en', onEnd?: () => void) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser.');
      if (onEnd) onEnd();
      return;
    }

    try {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95; // Slightly slower for clarity & accessibility
      utterance.pitch = 1.0;

      // Select matching voice if installed
      const langCodeMap: Record<SupportedLanguage, string> = {
        en: 'en-IN',
        hi: 'hi-IN',
        kn: 'kn-IN',
      };
      utterance.lang = langCodeMap[lang] || 'en-US';

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith(langCodeMap[lang]) || v.lang.startsWith(lang));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => {
        TransitVoiceSynthesizer.isSpeaking = false;
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error:', e);
        TransitVoiceSynthesizer.isSpeaking = false;
        if (onEnd) onEnd();
      };

      TransitVoiceSynthesizer.isSpeaking = true;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to trigger speech synthesis', err);
      if (onEnd) onEnd();
    }
  }

  public static stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      TransitVoiceSynthesizer.isSpeaking = false;
    }
  }

  public static getSpeechActive(): boolean {
    return TransitVoiceSynthesizer.isSpeaking;
  }
}
