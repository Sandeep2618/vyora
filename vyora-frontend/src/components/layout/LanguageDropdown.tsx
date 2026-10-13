import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { changeLanguage } from '../../lib/i18n';
import {
  SelectRoot,
  SelectGroup,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectLabel,
} from '../ui/Select';

interface LanguageOption {
  code: 'en' | 'hi' | 'gu';
  label: string;
  nativeName: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી' },
];

export const LanguageDropdown: React.FC = () => {
  const { i18n, t } = useTranslation('common');

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const handleSelectLanguage = (code: string) => {
    changeLanguage(code as 'en' | 'hi' | 'gu');
  };

  return (
    <SelectRoot value={i18n.language} onValueChange={handleSelectLanguage}>
      <SelectTrigger
        className="h-9 px-2.5 sm:px-3 w-auto gap-2 rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] bg-white dark:bg-[#0D1C1B] hover:bg-[#F4F8F7] dark:hover:bg-[#142B2A] text-xs font-semibold text-[#123B3A] dark:text-[#F0FDFA] shadow-2xs cursor-pointer"
        title={t('languages.select', { defaultValue: 'Select Language' })}
      >
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6] shrink-0" />
          <span className="font-semibold text-xs text-[#123B3A] dark:text-[#F0FDFA]">
            {currentLang.nativeName}
          </span>
        </div>
      </SelectTrigger>

      <SelectContent align="end" className="min-w-[11rem]">
        <SelectGroup>
          <SelectLabel className="px-3 py-1.5 border-b border-[#D7E5E2] dark:border-[#1E3B38] text-[10px] font-bold text-[#566B69] dark:text-[#8FA8A4] uppercase tracking-wider">
            {t('languages.select', { defaultValue: 'Select Language' })}
          </SelectLabel>
          {LANGUAGES.map((lang) => (
            <SelectItem key={lang.code} value={lang.code} className="cursor-pointer">
              <div className="flex flex-col text-left py-0.5">
                <span className="font-bold text-xs text-[#123B3A] dark:text-[#F0FDFA]">
                  {lang.nativeName}
                </span>
                <span className="text-[10px] text-[#566B69] dark:text-[#8FA8A4] font-normal">
                  {lang.label}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </SelectRoot>
  );
};
