'use client';

import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { usePreferences } from '@/contexts/preferences-context';
import type { Theme, FontSize } from '@/contexts/preferences-context';

interface SettingsPanelProps {
  onClose?: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { preferences, updatePreference } = usePreferences();

  const themes: { value: Theme; label: string; icon: any; description: string }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: LucideIcons.Sun,
      description: 'Bright and clean interface',
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: LucideIcons.Moon,
      description: 'Easy on the eyes',
    },
    {
      value: 'high-contrast',
      label: 'High Contrast',
      icon: LucideIcons.Contrast,
      description: 'Maximum readability',
    },
  ];

  const fontSizes: { value: FontSize; label: string; example: string }[] = [
    { value: 'small', label: 'Small', example: '14px' },
    { value: 'medium', label: 'Medium', example: '16px' },
    { value: 'large', label: 'Large', example: '18px' },
    { value: 'x-large', label: 'X-Large', example: '20px' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <LucideIcons.Settings className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-600">Customize your experience</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <LucideIcons.X size={20} />
          </button>
        )}
      </div>

      {/* Theme Selection */}
      <section aria-labelledby="theme-heading">
        <h3 id="theme-heading" className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <LucideIcons.Palette size={20} className="text-purple-600" />
          Theme
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((theme) => {
            const Icon = theme.icon;
            const isSelected = preferences.theme === theme.value;
            return (
              <button
                key={theme.value}
                onClick={() => updatePreference('theme', theme.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
                aria-label={`Switch to ${theme.label} theme`}
                aria-pressed={isSelected}
              >
                <Icon size={24} className={isSelected ? 'text-purple-600' : 'text-gray-600'} />
                <div className="text-center">
                  <div className="font-medium text-sm">{theme.label}</div>
                  <div className="text-xs text-gray-500">{theme.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Font Size */}
      <section aria-labelledby="font-size-heading">
        <h3 id="font-size-heading" className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <LucideIcons.Type size={20} className="text-purple-600" />
          Font Size
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {fontSizes.map((size) => {
            const isSelected = preferences.fontSize === size.value;
            return (
              <button
                key={size.value}
                onClick={() => updatePreference('fontSize', size.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }`}
                aria-label={`Set font size to ${size.label}`}
                aria-pressed={isSelected}
              >
                <div className="font-bold text-gray-900">{size.label}</div>
                <div className="text-xs text-gray-500">{size.example}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Accessibility Options */}
      <section aria-labelledby="accessibility-heading">
        <h3 id="accessibility-heading" className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <LucideIcons.Accessibility size={20} className="text-purple-600" />
          Accessibility
        </h3>
        <div className="space-y-3">
          {/* Dyslexic Font */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <LucideIcons.BookOpen size={18} className="text-purple-600" />
                <span className="font-medium text-gray-900">OpenDyslexic Font</span>
              </div>
              <p className="text-sm text-gray-600">Specialized font for easier reading</p>
            </div>
            <button
              onClick={() => updatePreference('useDyslexicFont', !preferences.useDyslexicFont)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.useDyslexicFont ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={preferences.useDyslexicFont}
              aria-label="Toggle dyslexic font"
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: preferences.useDyslexicFont ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <LucideIcons.Zap size={18} className="text-purple-600" />
                <span className="font-medium text-gray-900">Reduce Motion</span>
              </div>
              <p className="text-sm text-gray-600">Minimize animations and transitions</p>
            </div>
            <button
              onClick={() => updatePreference('reducedMotion', !preferences.reducedMotion)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.reducedMotion ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={preferences.reducedMotion}
              aria-label="Toggle reduced motion"
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: preferences.reducedMotion ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* High Contrast */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <LucideIcons.Eye size={18} className="text-purple-600" />
                <span className="font-medium text-gray-900">High Contrast Mode</span>
              </div>
              <p className="text-sm text-gray-600">Enhanced borders and text emphasis</p>
            </div>
            <button
              onClick={() => updatePreference('highContrast', !preferences.highContrast)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.highContrast ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={preferences.highContrast}
              aria-label="Toggle high contrast mode"
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: preferences.highContrast ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Screen Reader Optimized */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <LucideIcons.Volume2 size={18} className="text-purple-600" />
                <span className="font-medium text-gray-900">Screen Reader Optimized</span>
              </div>
              <p className="text-sm text-gray-600">Enhanced ARIA labels and descriptions</p>
            </div>
            <button
              onClick={() =>
                updatePreference('screenReaderOptimized', !preferences.screenReaderOptimized)
              }
              className={`relative w-12 h-6 rounded-full transition-colors ${
                preferences.screenReaderOptimized ? 'bg-purple-600' : 'bg-gray-300'
              }`}
              role="switch"
              aria-checked={preferences.screenReaderOptimized}
              aria-label="Toggle screen reader optimization"
            >
              <motion.div
                className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                animate={{ x: preferences.screenReaderOptimized ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <LucideIcons.Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Settings are saved automatically</p>
            <p className="text-blue-700">
              Your preferences are stored and will persist across sessions.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
