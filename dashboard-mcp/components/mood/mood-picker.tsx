'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';

export type MoodType = 'struggling' | 'difficult' | 'okay' | 'good' | 'great';

interface MoodPickerProps {
  onMoodSelect: (mood: MoodType, note?: string, energyLevel?: number) => void;
  onCancel?: () => void;
  compact?: boolean;
}

const moods: { type: MoodType; emoji: string; label: string; color: string }[] = [
  { type: 'struggling', emoji: '😢', label: 'Struggling', color: '#EF4444' },
  { type: 'difficult', emoji: '😟', label: 'Difficult', color: '#F59E0B' },
  { type: 'okay', emoji: '😐', label: 'Okay', color: '#6B7280' },
  { type: 'good', emoji: '🙂', label: 'Good', color: '#3B82F6' },
  { type: 'great', emoji: '😊', label: 'Great', color: '#10B981' },
];

export default function MoodPicker({ onMoodSelect, onCancel, compact = false }: MoodPickerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [energyLevel, setEnergyLevel] = useState(3);
  const [showDetails, setShowDetails] = useState(false);

  const handleMoodClick = (mood: MoodType) => {
    setSelectedMood(mood);
    if (compact) {
      onMoodSelect(mood);
    } else {
      setShowDetails(true);
    }
  };

  const handleSubmit = () => {
    if (selectedMood) {
      onMoodSelect(selectedMood, note || undefined, energyLevel);
      setSelectedMood(null);
      setNote('');
      setEnergyLevel(3);
      setShowDetails(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {moods.map((mood) => (
          <motion.button
            key={mood.type}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleMoodClick(mood.type)}
            className="text-3xl hover:opacity-80 transition-opacity"
            title={mood.label}
          >
            {mood.emoji}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!showDetails ? (
        <>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How are you feeling?</h3>
          <div className="grid grid-cols-5 gap-3">
            {moods.map((mood) => (
              <motion.button
                key={mood.type}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMoodClick(mood.type)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  selectedMood === mood.type
                    ? 'border-purple-600 bg-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                }`}
                style={{
                  borderColor: selectedMood === mood.type ? mood.color : undefined,
                }}
              >
                <span className="text-4xl">{mood.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{mood.label}</span>
              </motion.button>
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowDetails(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LucideIcons.ChevronLeft size={20} />
            </button>
            <h3 className="text-lg font-semibold text-gray-900">
              Feeling {selectedMood && moods.find(m => m.type === selectedMood)?.label}
            </h3>
            <span className="text-4xl ml-auto">
              {selectedMood && moods.find(m => m.type === selectedMood)?.emoji}
            </span>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's on your mind? (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g., Feeling overwhelmed with tasks..."
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none resize-none"
              rows={3}
            />
          </div>

          {/* Energy Level */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Energy Level
              </label>
              <span className="text-sm font-bold text-purple-600">{energyLevel}/5</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyLevel(level)}
                  className={`flex-1 h-12 rounded-xl transition-all ${
                    level <= energyLevel
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Save Mood Check-in
            </motion.button>
            {onCancel && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onCancel}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Cancel
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
