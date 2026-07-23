"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

type FieldType = "text" | "textarea" | "select" | "checkbox";

interface FormField {
    id: string;
    label: string;
    type: FieldType;
    required: boolean;
    options: string[];
    order: number;
}

interface InquiryFormProps {
    handle: string;
    theme?: string;
}

export function InquiryForm({ handle, theme = "creator-pro" }: InquiryFormProps) {
    const { data: session } = useSession();
    const [settings, setSettings] = useState<{ inquiryEnabled: boolean; fields: FormField[] } | null>(null);
    const [fanName, setFanName] = useState("");
    const [fanEmail, setFanEmail] = useState("");
    const [message, setMessage] = useState("");
    const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(`/api/${handle}/inquiries`)
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data) setSettings(data); })
            .catch(() => {});
    }, [handle]);

    // ログインユーザーの情報を自動入力
    useEffect(() => {
        if (session?.user) {
            if (session.user.name && !fanName) setFanName(session.user.name);
            if (session.user.email && !fanEmail) setFanEmail(session.user.email);
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            const res = await fetch(`/api/${handle}/inquiries`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fanName: fanName.trim(),
                    fanEmail: fanEmail.trim(),
                    message: message.trim(),
                    fields: fieldValues,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || "送信に失敗しました");
                return;
            }

            setSubmitted(true);
        } catch {
            setError("送信に失敗しました。もう一度お試しください。");
        } finally {
            setSubmitting(false);
        }
    };

    if (!settings || !settings.inquiryEnabled) return null;

    const isDark = ["creator-pro", "neon-pro", "studio-pro"].includes(theme);
    const accent = theme === "neon-pro" ? "#00d4ff"
        : theme === "velvet-pro" ? "#d97706"
        : theme === "pure-lite" ? "#ec4899"
        : theme === "zine-lite" ? "#10b981"
        : "#223C7D";

    const inputClass = isDark
        ? "w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-white/30 outline-none focus:border-white/30 text-sm"
        : "w-full bg-black/5 border border-black/10 rounded-lg px-4 py-2.5 text-gray-800 placeholder:text-gray-400 outline-none focus:border-black/20 text-sm";

    const labelClass = isDark
        ? "block text-xs font-medium text-white/60 mb-1.5"
        : "block text-xs font-medium text-gray-500 mb-1.5";

    if (submitted) {
        return (
            <div className={`rounded-2xl p-8 text-center ${isDark ? "bg-white/5" : "bg-black/5"}`}>
                <div className="text-3xl mb-3">✉️</div>
                <p className={`font-semibold text-lg mb-1 ${isDark ? "text-white" : "text-gray-800"}`}>
                    送信しました
                </p>
                <p className={`text-sm ${isDark ? "text-white/50" : "text-gray-500"}`}>
                    お問い合わせありがとうございます。内容を確認後、ご返信いたします。
                </p>
            </div>
        );
    }

    return (
        <div className={`rounded-2xl p-6 ${isDark ? "bg-white/5" : "bg-black/5"}`}>
            <h2 className={`text-lg font-bold mb-5 ${isDark ? "text-white" : "text-gray-800"}`}>
                お問い合わせ
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={labelClass}>
                        お名前 <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        value={fanName}
                        onChange={e => setFanName(e.target.value)}
                        required
                        placeholder="山田 太郎"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className={labelClass}>
                        メールアドレス <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="email"
                        value={fanEmail}
                        onChange={e => setFanEmail(e.target.value)}
                        required
                        placeholder="your@email.com"
                        className={inputClass}
                    />
                </div>

                {/* Custom fields */}
                {settings.fields.map(field => (
                    <div key={field.id}>
                        <label className={labelClass}>
                            {field.label}
                            {field.required && <span className="text-red-400 ml-1">*</span>}
                        </label>

                        {field.type === "text" && (
                            <input
                                type="text"
                                value={fieldValues[field.id] ?? ""}
                                onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                required={field.required}
                                className={inputClass}
                            />
                        )}

                        {field.type === "textarea" && (
                            <textarea
                                value={fieldValues[field.id] ?? ""}
                                onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                required={field.required}
                                rows={3}
                                className={`${inputClass} resize-none`}
                            />
                        )}

                        {field.type === "select" && (
                            <select
                                value={fieldValues[field.id] ?? ""}
                                onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                                required={field.required}
                                className={`${inputClass} ${isDark ? "bg-[#2a2a2a]" : "bg-white"}`}
                            >
                                <option value="">選択してください</option>
                                {field.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        )}

                        {field.type === "checkbox" && field.options.length > 0 && (
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                {field.options.map(opt => {
                                    const selected = (fieldValues[field.id] ?? "").split(",").filter(Boolean);
                                    const checked = selected.includes(opt);
                                    return (
                                        <label key={opt} className={`flex items-center gap-2 cursor-pointer min-w-0 ${isDark ? "text-white/80" : "text-gray-700"}`}>
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={e => {
                                                    const next = e.target.checked
                                                        ? [...selected, opt]
                                                        : selected.filter(v => v !== opt);
                                                    setFieldValues(prev => ({ ...prev, [field.id]: next.join(",") }));
                                                }}
                                                className="rounded shrink-0"
                                            />
                                            <span className="text-sm break-all">{opt}</span>
                                        </label>
                                    );
                                })}
                                {/* hidden input for required validation */}
                                {field.required && (
                                    <input
                                        type="text"
                                        required
                                        value={(fieldValues[field.id] ?? "").split(",").filter(Boolean).length > 0 ? "ok" : ""}
                                        onChange={() => {}}
                                        className="sr-only"
                                        tabIndex={-1}
                                    />
                                )}
                            </div>
                        )}

                        {field.type === "checkbox" && field.options.length === 0 && (
                            <label className={`flex items-center gap-2 cursor-pointer ${isDark ? "text-white/80" : "text-gray-700"}`}>
                                <input
                                    type="checkbox"
                                    checked={fieldValues[field.id] === "true"}
                                    onChange={e => setFieldValues(prev => ({ ...prev, [field.id]: e.target.checked ? "true" : "false" }))}
                                    required={field.required}
                                    className="rounded"
                                />
                                <span className="text-sm">{field.label}</span>
                            </label>
                        )}
                    </div>
                ))}

                <div>
                    <label className={labelClass}>
                        メッセージ <span className="text-red-400">*</span>
                    </label>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        required
                        rows={5}
                        placeholder="お問い合わせ内容をご記入ください"
                        className={`${inputClass} resize-none`}
                    />
                </div>

                {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    style={{ backgroundColor: accent }}
                    className="w-full py-3 rounded-xl font-semibold text-sm text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                    {submitting ? "送信中..." : "送信する"}
                </button>
            </form>
        </div>
    );
}
