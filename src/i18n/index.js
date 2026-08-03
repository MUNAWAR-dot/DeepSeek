import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import zh from './zh.json';
import hi from './hi.json';
import ur from './ur.json';
import ar from './ar.json';
import bn from './bn.json';
import id from './id.json';
import ja from './ja.json';
import ko from './ko.json';
import vi from './vi.json';
import th from './th.json';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  hi: { translation: hi },
  ur: { translation: ur },
  ar: { translation: ar },
  bn: { translation: bn },
  id: { translation: id },
  ja: { translation: ja },
  ko: { translation: ko },
  vi: { translation: vi },
  th: { translation: th },
};

const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      const storedLanguage = await AsyncStorage.getItem('appLanguage');
      if (storedLanguage) {
        callback(storedLanguage);
        return;
      }
      
      const locales = getLocales();
      const deviceLanguage = locales[0]?.languageCode || 'en';
      callback(deviceLanguage);
    } catch (error) {
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem('appLanguage', language);
    } catch (error) {
      console.error('Error caching language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
