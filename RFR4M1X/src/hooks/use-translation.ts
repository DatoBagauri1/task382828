import { getDictionary } from '@/i18n/translations';
import { useSettingsStore } from '@/store/settings-store';
import type { Locale, LocalizedString } from '@/types';

export const useTranslation = () => {
  const locale = useSettingsStore((state) => state.locale);
  return getDictionary(locale);
};

export const useLocale = () => useSettingsStore((state) => state.locale);

export const useLocalizedText = (value: LocalizedString, locale?: Locale) => {
  const activeLocale = useSettingsStore((state) => state.locale);
  return value[locale ?? activeLocale];
};
