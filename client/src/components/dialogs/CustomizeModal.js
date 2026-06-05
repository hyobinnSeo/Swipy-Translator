import React, { useState } from 'react';
import { X, Plus, Trash2, Loader2, Lock } from 'lucide-react';
import DialogWrapper from './DialogWrapper';

// Per-tab definitions: form fields, payload builder, and how to show an item.
const TAB_DEFS = {
    tones: {
        label: 'Tones',
        fields: [
            { key: 'name', type: 'text', placeholder: 'Name (e.g. Poetic / 시적)' },
            { key: 'description', type: 'text', placeholder: 'Short description (optional)' },
            { key: 'instruction', type: 'textarea', placeholder: 'Tone instructions sent to the AI (optional), e.g.\nTone and Style:\n- Use poetic, rhythmic language' }
        ],
        buildPayload: (f) => ({
            name: (f.name || '').trim(),
            description: (f.description || '').trim(),
            instruction: (f.instruction || '').trim()
        }),
        validate: (f) => (!f.name || !f.name.trim() ? 'Tone name is required.' : null),
        title: (item) => item.name,
        subtitle: (item) => item.description || ''
    },
    languages: {
        label: 'Languages',
        fields: [
            { key: 'code', type: 'text', placeholder: 'Language code (e.g. tl, vi, th)' },
            { key: 'name', type: 'text', placeholder: 'Display name (e.g. Tagalog)' }
        ],
        buildPayload: (f) => ({
            code: (f.code || '').trim().toLowerCase(),
            name: (f.name || '').trim()
        }),
        validate: (f) => {
            if (!f.code || !f.code.trim()) return 'Language code is required.';
            if (!f.name || !f.name.trim()) return 'Language name is required.';
            return null;
        },
        title: (item) => item.name,
        subtitle: (item) => item.code
    },
    models: {
        label: 'Models',
        fields: [
            { key: 'name', type: 'text', placeholder: 'Display name (e.g. Gemini 2.5 Pro)' },
            {
                key: 'api',
                type: 'select',
                placeholder: 'Provider',
                options: [
                    { value: '', label: 'Select provider...' },
                    { value: 'google', label: 'Google (Gemini)' },
                    { value: 'anthropic', label: 'Anthropic (Claude)' },
                    { value: 'openai', label: 'OpenAI (GPT)' },
                    { value: 'openrouter', label: 'OpenRouter (Cohere, ...)' }
                ]
            },
            { key: 'modelSlug', type: 'text', placeholder: 'Model id / slug (e.g. gemini-2.5-pro, anthropic/claude-3.5-sonnet, gpt-4o)' }
        ],
        buildPayload: (f) => ({
            name: (f.name || '').trim(),
            api: (f.api || '').trim(),
            modelSlug: (f.modelSlug || '').trim()
        }),
        validate: (f) => {
            if (!f.name || !f.name.trim()) return 'Model name is required.';
            if (!['google', 'anthropic', 'openrouter', 'openai'].includes((f.api || '').trim())) return 'Please select a provider.';
            if (!f.modelSlug || !f.modelSlug.trim()) return 'Model id / slug is required.';
            return null;
        },
        title: (item) => item.name,
        subtitle: (item) => `${item.api} · ${item.modelSlug}`
    }
};

const TabSection = ({ tabKey, data, darkMode }) => {
    const def = TAB_DEFS[tabKey];
    const [form, setForm] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const inputClass = `w-full p-2 rounded-lg focus:ring-2 ${
        darkMode
            ? 'bg-slate-700 border-slate-600 text-slate-100 focus:ring-blue-500/30 placeholder-slate-400'
            : 'border focus:ring-gray-500'
    }`;

    const handleAdd = async () => {
        const validationError = def.validate(form);
        if (validationError) {
            setFormError(validationError);
            return;
        }
        setSubmitting(true);
        setFormError('');
        try {
            await data.add(def.buildPayload(form));
            setForm({});
        } catch (err) {
            setFormError(err.message || 'Failed to add.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        setDeletingId(id);
        try {
            await data.remove(id);
        } catch (err) {
            setFormError(err.message || 'Failed to delete.');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Add form */}
            <div className={`p-4 rounded-lg space-y-3 ${darkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                    Add new
                </h3>
                {def.fields.map((field) => {
                    if (field.type === 'select') {
                        return (
                            <select
                                key={field.key}
                                value={form[field.key] || ''}
                                onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                                className={inputClass}
                            >
                                {field.options.map((opt) => (
                                    <option key={opt.value} value={opt.value} className={darkMode ? 'bg-slate-700' : ''}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        );
                    }
                    if (field.type === 'textarea') {
                        return (
                            <textarea
                                key={field.key}
                                value={form[field.key] || ''}
                                onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                                placeholder={field.placeholder}
                                className={`${inputClass} h-28 resize-none`}
                            />
                        );
                    }
                    return (
                        <input
                            key={field.key}
                            type="text"
                            value={form[field.key] || ''}
                            onChange={(e) => setForm((p) => ({ ...p, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className={inputClass}
                        />
                    );
                })}
                {formError && <p className="text-sm text-red-500">{formError}</p>}
                <button
                    onClick={handleAdd}
                    disabled={submitting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white ${
                        darkMode ? 'bg-navy-400 hover:bg-navy-500' : 'bg-navy-500 hover:bg-navy-600'
                    } ${submitting ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Add
                </button>
            </div>

            {/* Custom items */}
            <div className="space-y-2">
                <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                    Your {def.label.toLowerCase()}
                </h3>
                {data.isLoading && (
                    <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                    </div>
                )}
                {data.error && !data.isLoading && <p className="text-sm text-red-500">{data.error}</p>}
                {!data.isLoading && !data.error && data.custom.length === 0 && (
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                        None yet. Add one above.
                    </p>
                )}
                {data.custom.map((item) => (
                    <div
                        key={item.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-white border'}`}
                    >
                        <div className="min-w-0 pr-3">
                            <div className={`font-medium truncate ${darkMode ? 'text-slate-100' : ''}`}>{def.title(item)}</div>
                            {def.subtitle(item) && (
                                <div className={`text-sm truncate ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {def.subtitle(item)}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className={`p-2 rounded-lg ${
                                darkMode ? 'text-red-400 hover:bg-slate-600' : 'text-red-500 hover:bg-gray-100'
                            } ${deletingId === item.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                            title="Delete"
                        >
                            {deletingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                    </div>
                ))}
            </div>

            {/* Built-in items (read-only) */}
            <div className="space-y-2">
                <h3 className={`text-sm font-semibold ${darkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                    Built-in {def.label.toLowerCase()}
                </h3>
                {data.builtIn.map((item, idx) => (
                    <div
                        key={item.id || item.code || idx}
                        className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-slate-700/40' : 'bg-gray-50'}`}
                    >
                        <div className="min-w-0 pr-3">
                            <div className={`font-medium truncate ${darkMode ? 'text-slate-200' : ''}`}>{def.title(item)}</div>
                            {def.subtitle(item) && (
                                <div className={`text-sm truncate ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                    {def.subtitle(item)}
                                </div>
                            )}
                        </div>
                        <Lock className={`h-4 w-4 ${darkMode ? 'text-slate-500' : 'text-gray-400'}`} />
                    </div>
                ))}
            </div>
        </div>
    );
};

const CustomizeModal = ({ isOpen, onClose, darkMode, tones, models, languages }) => {
    const [activeTab, setActiveTab] = useState('tones');
    const dataByTab = { tones, languages, models };

    return (
        <DialogWrapper
            isOpen={isOpen}
            onClose={onClose}
            className="w-full max-w-2xl max-h-[90vh] flex flex-col"
            darkMode={darkMode}
        >
            {/* Header */}
            <div className={`p-6 border-b ${darkMode ? 'border-slate-700' : ''}`}>
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className={`text-xl font-semibold ${darkMode ? 'text-slate-100' : ''}`}>Customize</h2>
                        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                            Add or remove your own tones, languages, and models
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className={darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-700'}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                    {Object.keys(TAB_DEFS).map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveTab(key)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === key
                                    ? (darkMode ? 'bg-navy-400 text-white' : 'bg-navy-500 text-white')
                                    : (darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100')
                            }`}
                        >
                            {TAB_DEFS[key].label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <TabSection key={activeTab} tabKey={activeTab} data={dataByTab[activeTab]} darkMode={darkMode} />
            </div>

            {/* Footer */}
            <div className={`p-6 border-t ${darkMode ? 'border-slate-700' : ''}`}>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 text-white rounded-lg ${
                            darkMode ? 'bg-navy-400 hover:bg-navy-500' : 'bg-navy-500 hover:bg-navy-600'
                        }`}
                    >
                        Done
                    </button>
                </div>
            </div>
        </DialogWrapper>
    );
};

export default CustomizeModal;
