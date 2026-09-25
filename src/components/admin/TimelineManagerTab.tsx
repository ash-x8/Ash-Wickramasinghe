import React, { useState } from 'react';
import { 
  Briefcase, 
  GraduationCap, 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Calendar,
  Building,
  Sparkles,
  Clock
} from 'lucide-react';
import { TimelineItem } from '../../types';

interface TimelineManagerTabProps {
  timeline: TimelineItem[];
  onSave: (timeline: TimelineItem[]) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const TimelineManagerTab: React.FC<TimelineManagerTabProps> = ({
  timeline: initialTimeline,
  onSave,
  showToast
}) => {
  const [timeline, setTimeline] = useState<TimelineItem[]>(initialTimeline || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (Array.isArray(initialTimeline)) {
      setTimeline(initialTimeline);
    }
  }, [initialTimeline]);

  // Form state
  const [formData, setFormData] = useState<TimelineItem>({
    id: '',
    period: '',
    role: '',
    organization: '',
    description: '',
    skills: [],
    type: 'work'
  });
  const [skillsInput, setSkillsInput] = useState('');

  const handleStartAdd = () => {
    setFormData({
      id: `timeline-${Date.now()}`,
      period: '2024 — Present',
      role: '',
      organization: '',
      description: '',
      skills: [],
      type: 'work'
    });
    setSkillsInput('');
    setEditingId(null);
    setIsAddingNew(true);
  };

  const handleStartEdit = (item: TimelineItem) => {
    setFormData({ ...item });
    setSkillsInput(item.skills ? item.skills.join(', ') : '');
    setEditingId(item.id);
    setIsAddingNew(false);
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.role.trim() || !formData.organization.trim()) {
      showToast('Role and organization/institution are required', 'error');
      return;
    }

    const parsedSkills = skillsInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const itemToSave: TimelineItem = {
      ...formData,
      role: formData.role.trim(),
      organization: formData.organization.trim(),
      period: formData.period.trim(),
      description: formData.description.trim(),
      skills: parsedSkills
    };

    let updated: TimelineItem[];
    if (isAddingNew) {
      updated = [itemToSave, ...timeline];
    } else {
      updated = timeline.map(item => item.id === editingId ? itemToSave : item);
    }

    setSaving(true);
    try {
      await onSave(updated);
      setTimeline(updated);
      showToast(isAddingNew ? 'Timeline record added' : 'Timeline record updated');
      setIsAddingNew(false);
      setEditingId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save timeline item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const target = timeline.find(t => t.id === id);
    if (!window.confirm(`Are you sure you want to delete "${target?.role || 'this entry'}"?`)) return;

    const updated = timeline.filter(t => t.id !== id);
    setSaving(true);
    try {
      await onSave(updated);
      setTimeline(updated);
      showToast('Timeline record removed');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete timeline item', 'error');
    } finally {
      setSaving(false);
    }
  };

  const getTypeIcon = (type: TimelineItem['type']) => {
    switch (type) {
      case 'work': return <Briefcase size={14} className="text-[#C59B63]" />;
      case 'education': return <GraduationCap size={14} className="text-sky-400" />;
      case 'certification': return <Award size={14} className="text-amber-400" />;
      default: return <Clock size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock size={20} className="text-[#C59B63]" />
            Experience &amp; Career Trajectory
          </h2>
          <p className="text-xs text-slate-400">
            Chronological milestones, design roles, client engagements, and educational background.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartAdd}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#C59B63] hover:bg-[#D8AC74] text-[#0A0D14] flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={15} />
          <span>Add Career Milestone</span>
        </button>
      </div>

      {/* Add / Edit Form */}
      {(isAddingNew || editingId !== null) && (
        <form 
          onSubmit={handleSubmitForm} 
          className="p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl space-y-4 text-xs"
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-[#C59B63]" />
              <span>{isAddingNew ? 'Add Career Milestone' : 'Edit Milestone'}</span>
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
            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Record Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as TimelineItem['type'] })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none"
              >
                <option value="work">Work &amp; Creative Experience</option>
                <option value="education">Education &amp; Studies</option>
                <option value="certification">Certification &amp; Honors</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Role / Position / Degree *</label>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Lead Graphic Designer"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Company / Institution *</label>
              <input
                type="text"
                required
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                placeholder="e.g. Freelance / Studio"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Time Period *</label>
              <input
                type="text"
                required
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="e.g. 2023 — Present"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-slate-300 font-semibold block">Associated Skills (Comma-separated)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Photoshop, Social Media Strategy, Visual Design"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Description &amp; Key Accomplishments</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of responsibilities, creative impact, and project deliverables..."
              className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none leading-relaxed"
            />
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
              <span>{isAddingNew ? 'Add Milestone' : 'Save Milestone'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Timeline Item Cards */}
      <div className="space-y-3">
        {timeline.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
            No milestones or experience entries registered yet. Click "Add Career Milestone" to begin.
          </div>
        ) : (
          timeline.map((item) => (
            <div 
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 text-xs"
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm">{item.role}</span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-slate-300 font-medium">{item.organization}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-[#C59B63] font-mono">
                      {item.period}
                    </span>
                  </div>

                  {item.description && (
                    <p className="text-slate-400 text-xs leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  )}

                  {item.skills && item.skills.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {item.skills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 self-end sm:self-start">
                <button
                  type="button"
                  onClick={() => handleStartEdit(item)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Edit milestone"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                  title="Delete milestone"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
