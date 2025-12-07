/**
 * Supported languages in the app
 */

export type Language = {
  code: string;
  name: string;
  nativeName: string;
};

export const LANGUAGES: Language[] = [
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
  },
];

export const DEFAULT_LANGUAGE = 'ru';
