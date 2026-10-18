import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Smartphone, X, Download, QrCode, ExternalLink, Copy, Check } from 'lucide-react';

interface MobileAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileAppModal: React.FC<MobileAppModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation('common');
  const [qrMode, setQrMode] = useState<'apk' | 'web'>('apk');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#112322] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D7E5E2] dark:border-[#1E3B38] space-y-4 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#123B3A] dark:text-[#E6F4F1]">
                {t('mobileAppModal.title', { defaultValue: 'Connect Mobile Counter' })}
              </h3>
            </div>
            <p className="text-xs text-[#566B69] dark:text-slate-400 mt-1">
              {t('mobileAppModal.subtitle', { defaultValue: 'Run Vyora Mobile on your Android or iPhone device.' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#566B69] dark:text-slate-400 hover:bg-[#F4F8F7] dark:hover:bg-[#162E2D] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4F8F7] dark:bg-[#162E2D] rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] text-xs font-bold">
          <button
            type="button"
            onClick={() => setQrMode('apk')}
            className={`py-2 px-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              qrMode === 'apk'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#566B69] dark:text-slate-400 hover:text-[#123B3A] dark:hover:text-[#E6F4F1]'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('mobileAppModal.tabApk', { defaultValue: 'Download APK' })}</span>
          </button>
          <button
            type="button"
            onClick={() => setQrMode('web')}
            className={`py-2 px-2.5 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              qrMode === 'web'
                ? 'bg-[#0F766E] text-white shadow-xs'
                : 'text-[#566B69] dark:text-slate-400 hover:text-[#123B3A] dark:hover:text-[#E6F4F1]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{t('mobileAppModal.tabWeb', { defaultValue: 'Web / Expo' })}</span>
          </button>
        </div>

        {/* QR Scanner Display Box with Viewfinder Target Brackets */}
        <div className="relative flex flex-col items-center justify-center p-4 bg-[#F4F8F7] dark:bg-[#0D1C1B] rounded-2xl border border-[#D7E5E2] dark:border-[#1E3B38]">
          <div className="relative bg-white p-3 rounded-xl border border-[#D7E5E2] shadow-xs mb-2">
            <div className="absolute top-1.5 left-1.5 w-4 h-4 border-t-2 border-l-2 border-[#0F766E] rounded-tl pointer-events-none" />
            <div className="absolute top-1.5 right-1.5 w-4 h-4 border-t-2 border-r-2 border-[#0F766E] rounded-tr pointer-events-none" />
            <div className="absolute bottom-1.5 left-1.5 w-4 h-4 border-b-2 border-l-2 border-[#0F766E] rounded-bl pointer-events-none" />
            <div className="absolute bottom-1.5 right-1.5 w-4 h-4 border-b-2 border-r-2 border-[#0F766E] rounded-br pointer-events-none" />

            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                qrMode === 'apk'
                  ? 'https://vyora-website-smoky.vercel.app/downloads/vyora-v1.0.1.apk'
                  : 'https://vyora-app-alpha.vercel.app'
              )}`}
              alt="Vyora Mobile QR Code"
              className="w-44 h-44 object-contain"
            />
          </div>
          <p className="text-[11px] font-bold text-[#0F766E] dark:text-[#14B8A6] flex items-center gap-1 text-center">
            <QrCode className="w-3.5 h-3.5 shrink-0" />
            <span>
              {qrMode === 'apk'
                ? t('mobileAppModal.scanApk', { defaultValue: 'Scan with Camera to Download APK (~84 MB)' })
                : t('mobileAppModal.scanWeb', { defaultValue: 'Scan with Camera or Expo Go to Open' })}
            </span>
          </p>
        </div>

        {/* Step instructions */}
        <div className="space-y-1.5 text-xs text-[#123B3A] dark:text-[#E6F4F1]">
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
            <p>{t('mobileAppModal.step1', { defaultValue: 'Point phone camera at the QR code above or tap download below.' })}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
            <p>{qrMode === 'apk' ? t('mobileAppModal.step2Apk', { defaultValue: 'Chrome will download vyora-v1.0.1.apk directly.' }) : t('mobileAppModal.step2Web', { defaultValue: 'Tap "Add to Home screen" in Chrome or open via Expo Go.' })}</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="w-4 h-4 rounded-full bg-[#0F766E] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
            <p>{t('mobileAppModal.step3', { defaultValue: 'All sales and inventory stay 100% synchronized in real time!' })}</p>
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="flex gap-2 pt-1">
          <a
            href={
              qrMode === 'apk'
                ? 'https://expo.dev/artifacts/eas/LE4g5ZlUdSnYick5yHeMF_2YuoUWt1uc0ZvCPTXPzjo.apk'
                : 'https://vyora-app-alpha.vercel.app'
            }
            download={qrMode === 'apk' ? 'vyora-v1.0.1.apk' : undefined}
            target={qrMode === 'web' ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#0F766E] hover:bg-[#0D665F] text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-xs"
          >
            {qrMode === 'apk' ? <Download className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
            <span>{qrMode === 'apk' ? t('mobileAppModal.downloadApkBtn', { defaultValue: 'Download Standalone APK (~84 MB)' }) : t('mobileAppModal.launchWebBtn', { defaultValue: 'Launch Mobile Web App' })}</span>
          </a>

          <button
            type="button"
            onClick={() => {
              const url =
                qrMode === 'apk'
                  ? 'https://vyora-website-smoky.vercel.app/downloads/vyora-v1.0.1.apk'
                  : 'https://vyora-app-alpha.vercel.app';
              navigator.clipboard.writeText(url);
              setCopiedLink(true);
              setTimeout(() => setCopiedLink(false), 3000);
            }}
            className="inline-flex items-center justify-center gap-1.5 bg-[#F4F8F7] dark:bg-[#162E2D] hover:bg-[#E5EFEB] dark:hover:bg-[#1E3E3C] text-[#123B3A] dark:text-[#E6F4F1] text-xs font-bold px-3 py-2.5 rounded-xl border border-[#D7E5E2] dark:border-[#1E3B38] transition-colors cursor-pointer"
            title="Copy Link"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#14B8A6]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? t('mobileAppModal.copied', { defaultValue: 'Copied' }) : t('mobileAppModal.copy', { defaultValue: 'Copy' })}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
