import React, { useState } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Sparkles, 
  RotateCcw, 
  Sliders, 
  Check, 
  ShieldCheck, 
  Layers, 
  Info,
  Maximize2
} from 'lucide-react';
import { SiteSettings, MediaItem } from '../../types';
import { MediaPickerModal } from './MediaPickerModal';
import { ProfileEffectType, ProfilePhotoFrame } from '../ProfilePhotoFrame';

interface ProfilePhotoManagerProps {
  settings: SiteSettings;
  mediaList: MediaItem[];
  onChange: (updates: Partial<SiteSettings>) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

interface EffectOption {
  id: ProfileEffectType;
  label: string;
  description: string;
  cssPreview: string;
}

const EFFECT_OPTIONS: EffectOption[] = [
  {
    id: 'normal',
    label: 'Normal',
    description: 'Natural true-color rendering without filters',
    cssPreview: 'brightness-100 contrast-100 saturate-100'
  },
  {
    id: 'cinematic',
    label: 'Soft / Cinematic',
    description: 'Subtle warm tone, balanced contrast & filmic presence',
    cssPreview: 'contrast-110 saturate-[0.88] brightness-95 sepia-[0.10]'
  },
  {
    id: 'bw',
    label: 'Black & White',
    description: 'High-contrast studio monochrome for an editorial look',
    cssPreview: 'grayscale contrast-125 brightness-95'
  },
  {
    id: 'grayscale',
    label: 'Grayscale',
    description: 'Smooth neutral monochrome with even tonal gradients',
    cssPreview: 'grayscale contrast-100 brightness-100'
  },
  {
    id: 'blur',
    label: 'Controlled Blur',
    description: 'Artistic focal depth that reveals sharpness upon hover',
    cssPreview: 'blur-[1.5px] contrast-105'
  },
  {
    id: 'contrast',
    label: 'High Contrast',
    description: 'Bold graphic separation with punchy darks and highlights',
    cssPreview: 'contrast-130 brightness-95 saturate-110'
  }
];

export const ProfilePhotoManager: React.FC<ProfilePhotoManagerProps> = ({
  settings,
  mediaList,
  onChange,
  showToast
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'profile' | 'monogram' | 'fullLogo'>('profile');

  const currentPhoto = settings.avatarUrl || '';
  const currentEffect: ProfileEffectType = settings.profileImageEffect || 'cinematic';

  const handleSelectMedia = (url: string) => {
    if (pickerTarget === 'profile') {
      onChange({ avatarUrl: url, profileImage: url });
      showToast("Profile photo selected from gallery", "success");
    } else if (pickerTarget === 'monogram') {
      onChange({ logoMonogramUrl: url });
      showToast("AW monogram emblem updated", "success");
    } else if (pickerTarget === 'fullLogo') {
      onChange({ logoFullUrl: url });
      showToast("Full official brand logo updated", "success");
    }
  };

  const handleClearPhoto = () => {
    onChange({
      avatarUrl: '',
      profileImage: '',
      profileImageEffect: 'normal'
    });
    showToast("Profile photo removed. Showing neutral placeholder.", "info");
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Main Profile Photo & Effect Section */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Main Profile Photo System</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Controls the official portrait rendered in the Hero section and About narrative across the site.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setPickerTarget('profile');
                setIsPickerOpen(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-black hover:bg-slate-200 transition-colors flex items-center gap-1.5 shadow"
            >
              <ImageIcon size={14} />
              <span>Choose from Gallery / Upload</span>
            </button>
            {currentPhoto && (
              <button
                type="button"
                onClick={handleClearPhoto}
                className="px-3 py-2 rounded-xl text-xs text-rose-400 hover:text-white hover:bg-rose-900/40 transition-colors flex items-center gap-1"
                title="Remove current portrait"
              >
                <RotateCcw size={13} />
                <span>Remove Photo</span>
              </button>
            )}
          </div>
        </div>

        {/* Two-Column: Left Live Preview, Right Effect Selector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Live Portrait Preview Frame */}
          <div className="lg:col-span-4 space-y-3">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block font-semibold">
              Live Preview on Website:
            </span>
            <div className="max-w-[280px] mx-auto lg:mx-0">
              <ProfilePhotoFrame
                src={currentPhoto}
                effect={currentEffect}
                statusText={settings.statusText || "Open for Select Projects"}
              />
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Effect: <strong className="text-amber-400 uppercase">{currentEffect}</strong></span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck size={12} /> Non-destructive
              </span>
            </div>
          </div>

          {/* Right: Effect Selector */}
          <div className="lg:col-span-8 space-y-4">
            <div>
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Sliders size={14} className="text-amber-400" />
                <span>Select Portrait Visual Effect</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Effects are applied non-destructively through real-time CSS filters. The original high-resolution master asset remains untouched in cloud storage.
              </p>
            </div>

            {/* Effect Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {EFFECT_OPTIONS.map((eff) => {
                const isSelected = currentEffect === eff.id;
                return (
                  <button
                    key={eff.id}
                    type="button"
                    onClick={() => {
                      onChange({ profileImageEffect: eff.id });
                      showToast(`Effect updated to "${eff.label}"`, "success");
                    }}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    {/* Tiny thumbnail preview of effect */}
                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative">
                      <img
                        src={currentPhoto}
                        alt=""
                        className={`w-full h-full object-cover ${eff.cssPreview}`}
                      />
                    </div>

                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-bold ${isSelected ? 'text-amber-300' : 'text-slate-200'}`}>
                          {eff.label}
                        </span>
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
                        {eff.description}
                      </p>
                    </div>

                    {/* Checkmark icon */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Help note */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
              <Info size={14} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                Switching effects updates the live website instantly without re-uploading the photo. Both the Hero section and About page synchronize in real-time.
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Official Brand Logos Configuration */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C59B63]" />
            <span>Official Brand Logos &amp; Identity Assets</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage the official AW 3D monogram emblem and full official signature lockup across the site navigation, footer, and branding kits.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          
          {/* Logo 1: AW Monogram */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-xs">AW Monogram Logo (Emblem)</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">Navbar &amp; Favicon</span>
            </div>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-[#0A0D14] border border-slate-800 flex items-center justify-center p-3 relative group">
              <img
                src={settings.logoMonogramUrl || '/ash-logo-monogram.jpg'}
                alt="AW Monogram"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setPickerTarget('monogram');
                  setIsPickerOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-amber-400 text-slate-200 hover:text-amber-300 transition-colors flex items-center gap-1.5"
              >
                <ImageIcon size={13} />
                <span>Replace Monogram</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange({ logoMonogramUrl: '/ash-logo-monogram.jpg' });
                  showToast("Reset to official titanium & gold monogram", "info");
                }}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Reset Default
              </button>
            </div>
          </div>

          {/* Logo 2: Full Official Logo Lockup */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200 text-xs">Full Official Logo Lockup</span>
              <span className="text-[10px] font-mono text-[#C59B63] bg-amber-500/10 px-2 py-0.5 rounded">Footer &amp; Brand Kit</span>
            </div>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-[#0A0D14] border border-slate-800 flex items-center justify-center p-3 relative group">
              <img
                src={settings.logoFullUrl || '/ash-logo-full.jpg'}
                alt="Full Brand Logo"
                className="max-h-full max-w-full object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setPickerTarget('fullLogo');
                  setIsPickerOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-800 hover:border-amber-400 text-slate-200 hover:text-amber-300 transition-colors flex items-center gap-1.5"
              >
                <ImageIcon size={13} />
                <span>Replace Full Lockup</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onChange({ logoFullUrl: '/ash-logo-full.jpg' });
                  showToast("Reset to official full logo lockup", "info");
                }}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Reset Default
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Reusable Media Picker Dialog */}
      <MediaPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleSelectMedia}
        title={
          pickerTarget === 'profile' 
            ? "Choose Profile Photo" 
            : pickerTarget === 'monogram' 
            ? "Choose AW Monogram Logo" 
            : "Choose Full Official Logo"
        }
        categoryFilter={pickerTarget === 'profile' ? 'profile' : 'logo'}
        currentValue={
          pickerTarget === 'profile' 
            ? currentPhoto 
            : pickerTarget === 'monogram' 
            ? (settings.logoMonogramUrl || '/ash-logo-monogram.jpg')
            : (settings.logoFullUrl || '/ash-logo-full.jpg')
        }
        mediaList={mediaList}
      />

    </div>
  );
};
