import React, { useState } from 'react';
import { 
  Zap, 
  Plus, 
  Trash2, 
  Edit3, 
  MoveUp, 
  MoveDown, 
  Save, 
  Check, 
  X,
  Layers,
  Sparkles
} from 'lucide-react';
import { SkillItem } from '../../types';

interface SkillsManagerTabProps {
  skills: SkillItem[];
  onSave: (skills: SkillItem[]) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const DEFAULT_CATEGORIES = [
  'Design & Branding',
  'Social & Growth',
  'Content & Video',
  'Web & Digital'
];

export const SkillsManagerTab: React.FC<SkillsManagerTabProps> = ({
  skills: initialSkills,
  onSave,
  showToast
}) => {
  const [skills, setSkills] = useState<SkillItem[]>(initialSkills || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState<SkillItem>({
    name: '',
    level: 90,
    category: 'Design & Branding'
  });

  const handleStartAdd = () => {
    setFormData({
      name: '',
      level: 85,
      category: 'Design & Branding'
    });
    setEditingIndex(null);
    setIsAddingNew(true);
  };

  const handleStartEdit = (index: number) => {
    setFormData({ ...skills[index] });
    setEditingIndex(index);
    setIsAddingNew(false);
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingIndex(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Skill name is required', 'error');
      return;
    }

    let updated: SkillItem[];
    if (isAddingNew) {
      updated = [...skills, { ...formData, name: formData.name.trim() }];
    } else if (editingIndex !== null) {
      updated = [...skills];
      updated[editingIndex] = { ...formData, name: formData.name.trim() };
    } else {
      return;
    }

    setSaving(true);
    try {
      await onSave(updated);
      setSkills(updated);
      showToast(isAddingNew ? 'Skill added successfully' : 'Skill updated successfully');
      setIsAddingNew(false);
      setEditingIndex(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save skill', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSkill = async (index: number) => {
    const item = skills[index];
    if (!window.confirm(`Are you sure you want to remove "${item.name}"?`)) return;

    const updated = skills.filter((_, i) => i !== index);
    setSaving(true);
    try {
      await onSave(updated);
      setSkills(updated);
      showToast(`Removed "${item.name}"`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete skill', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= skills.length) return;

    const updated = [...skills];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setSaving(true);
    try {
      await onSave(updated);
      setSkills(updated);
      showToast('Skill reordered');
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder skill', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Group skills by category for clear management
  const categories = Array.from(new Set(skills.map(s => s.category || 'General')));

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap size={20} className="text-[#C59B63]" />
            Skills &amp; Technical Capabilities
          </h2>
          <p className="text-xs text-slate-400">
            Manage your design tool proficiencies, creative competencies, and public skill bars.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartAdd}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#C59B63] hover:bg-[#D8AC74] text-[#0A0D14] flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={15} />
          <span>Add New Skill</span>
        </button>
      </div>

      {/* Add / Edit Form Modal or Inline Drawer */}
      {(isAddingNew || editingIndex !== null) && (
        <form 
          onSubmit={handleSubmitForm} 
          className="p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl space-y-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-[#C59B63]" />
              <span>{isAddingNew ? 'Add New Skill' : 'Edit Skill'}</span>
            </h3>
            <button
              type="button"
              onClick={handleCancelForm}
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1 space-y-1.5">
              <label className="text-slate-300 font-semibold block">Skill Title *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Social Media Strategy"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none"
              />
            </div>

            <div className="sm:col-span-1 space-y-1.5">
              <label className="text-slate-300 font-semibold block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none"
              >
                {DEFAULT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-1 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-slate-300 font-semibold">Proficiency Level</label>
                <span className="font-mono text-[#C59B63] font-bold">{formData.level}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                className="w-full accent-[#C59B63] cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleCancelForm}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-[#C59B63] hover:bg-[#D8AC74] text-[#0A0D14] font-semibold flex items-center gap-1.5"
            >
              {saving ? <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Save size={14} />}
              <span>{isAddingNew ? 'Add Skill' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Skills List Table / Grid */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-[#C59B63]" />
            <span className="font-medium text-white">{skills.length} Total Skills Listed</span>
          </div>
          <span className="text-[11px] text-slate-500">Ordered by display priority</span>
        </div>

        {skills.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No skills listed yet. Click "Add New Skill" to populate your competencies.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {skills.map((skill, index) => (
              <div 
                key={`${skill.name}-${index}`}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-850/50 transition-colors text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0 || saving}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 hover:bg-slate-800"
                      title="Move up"
                    >
                      <MoveUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={index === skills.length - 1 || saving}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 hover:bg-slate-800"
                      title="Move down"
                    >
                      <MoveDown size={12} />
                    </button>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white text-sm">{skill.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                        {skill.category}
                      </span>
                    </div>
                    {/* Visual Progress Bar Preview */}
                    <div className="w-48 sm:w-64 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#C59B63] to-[#D8AC74] rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="font-mono text-xs font-bold text-[#C59B63]">{skill.level}%</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(index)}
                      className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Edit skill"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSkill(index)}
                      className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                      title="Delete skill"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
