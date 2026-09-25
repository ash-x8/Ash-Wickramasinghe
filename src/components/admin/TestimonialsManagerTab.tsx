import React, { useState } from 'react';
import { 
  MessageSquareQuote, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Star,
  User,
  Building,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { TestimonialItem } from '../../types';

interface TestimonialsManagerTabProps {
  testimonials: TestimonialItem[];
  onSave: (testimonials: TestimonialItem[]) => Promise<void>;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const TestimonialsManagerTab: React.FC<TestimonialsManagerTabProps> = ({
  testimonials: initialTestimonials,
  onSave,
  showToast
}) => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(initialTestimonials || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (Array.isArray(initialTestimonials)) {
      setTestimonials(initialTestimonials);
    }
  }, [initialTestimonials]);

  // Form state
  const [formData, setFormData] = useState<TestimonialItem>({
    id: '',
    clientName: '',
    role: '',
    company: '',
    avatar: '',
    content: '',
    rating: 5,
    projectRef: ''
  });

  const handleStartAdd = () => {
    setFormData({
      id: `review-${Date.now()}`,
      clientName: '',
      role: '',
      company: '',
      avatar: '',
      content: '',
      rating: 5,
      projectRef: ''
    });
    setEditingId(null);
    setIsAddingNew(true);
  };

  const handleStartEdit = (item: TestimonialItem) => {
    setFormData({ ...item });
    setEditingId(item.id);
    setIsAddingNew(false);
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.content.trim()) {
      showToast('Client name and review content are required', 'error');
      return;
    }

    const itemToSave: TestimonialItem = {
      ...formData,
      clientName: formData.clientName.trim(),
      role: formData.role.trim(),
      company: formData.company.trim(),
      content: formData.content.trim(),
      avatar: formData.avatar?.trim() || undefined,
      projectRef: formData.projectRef?.trim() || undefined
    };

    let updated: TestimonialItem[];
    if (isAddingNew) {
      updated = [itemToSave, ...testimonials];
    } else {
      updated = testimonials.map(item => item.id === editingId ? itemToSave : item);
    }

    setSaving(true);
    try {
      await onSave(updated);
      setTestimonials(updated);
      showToast(isAddingNew ? 'Testimonial added' : 'Testimonial updated');
      setIsAddingNew(false);
      setEditingId(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to save testimonial', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    const target = testimonials.find(t => t.id === id);
    if (!window.confirm(`Are you sure you want to delete the testimonial from "${target?.clientName || 'this client'}"?`)) return;

    const updated = testimonials.filter(t => t.id !== id);
    setSaving(true);
    try {
      await onSave(updated);
      setTestimonials(updated);
      showToast('Testimonial removed');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete testimonial', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <MessageSquareQuote size={20} className="text-[#C59B63]" />
            Testimonials &amp; Client Endorsements
          </h2>
          <p className="text-xs text-slate-400">
            Publish client reviews, project feedback, and collaboration testimonials displayed on the homepage.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartAdd}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#C59B63] hover:bg-[#D8AC74] text-[#0A0D14] flex items-center gap-2 transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={15} />
          <span>Add New Testimonial</span>
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
              <span>{isAddingNew ? 'Add Client Testimonial' : 'Edit Testimonial'}</span>
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
              <label className="text-slate-300 font-semibold block">Client Name *</label>
              <input
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Ruwan Perera"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Role / Title</label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="e.g. Managing Director"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Company / Brand</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. Horizon Media"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Rating (1 to 5 Stars)</label>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star 
                      size={18} 
                      className={star <= formData.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'} 
                    />
                  </button>
                ))}
                <span className="text-slate-400 font-mono text-xs ml-2">{formData.rating} / 5</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Avatar Image URL (Optional)</label>
              <input
                type="text"
                value={formData.avatar || ''}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                placeholder="https://..."
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-semibold block">Project Reference / Category</label>
              <input
                type="text"
                value={formData.projectRef || ''}
                onChange={(e) => setFormData({ ...formData, projectRef: e.target.value })}
                placeholder="e.g. Brand Identity Suite"
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-[#C59B63] outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-300 font-semibold block">Review Quote / Testimonial Content *</label>
            <textarea
              rows={3}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="What did the client say about your design, communication, deliverables, or collaboration..."
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
              <span>{isAddingNew ? 'Add Testimonial' : 'Save Testimonial'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs">
            No client testimonials registered yet. Click "Add New Testimonial" to publish client feedback.
          </div>
        ) : (
          testimonials.map((item) => (
            <div 
              key={item.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between text-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-[#C59B63] overflow-hidden shrink-0">
                      {item.avatar ? (
                        <img src={item.avatar} alt={item.clientName} className="w-full h-full object-cover" />
                      ) : (
                        <User size={18} />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm">{item.clientName}</div>
                      <div className="text-slate-400 text-[11px]">
                        {item.role}{item.company ? ` • ${item.company}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'} 
                      />
                    ))}
                  </div>
                </div>

                <p className="text-slate-300 italic text-xs leading-relaxed">
                  "{item.content}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className="text-[10px] text-slate-500 font-mono">
                  {item.projectRef ? `Project: ${item.projectRef}` : 'Client Review'}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(item)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit testimonial"
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    title="Delete testimonial"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
