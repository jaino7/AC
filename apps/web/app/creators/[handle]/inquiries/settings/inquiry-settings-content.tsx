"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

type FieldType = "text" | "textarea" | "select" | "checkbox";

interface FormField {
    id?: string;
    label: string;
    type: FieldType;
    required: boolean;
    options: string[];
    order: number;
}

const fieldTypeLabels: Record<FieldType, string> = {
    text: "テキスト（1行）",
    textarea: "テキスト（複数行）",
    select: "プルダウン選択",
    checkbox: "チェックボックス",
};

export default function InquirySettingsContent() {
    const pathname = usePathname();
    const router = useRouter();
    const handle = pathname.split("/")[2];

    const [inquiryEnabled, setInquiryEnabled] = useState(true);
    const [fields, setFields] = useState<FormField[]>([]);
    const [optionsRaw, setOptionsRaw] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch(`/api/creators/${handle}/inquiry-settings`);
                if (res.ok) {
                    const data = await res.json();
                    setInquiryEnabled(data.inquiryEnabled);
                    const loaded: FormField[] = data.fields ?? [];
                    setFields(loaded);
                    const rawMap: Record<number, string> = {};
                    loaded.forEach((f, i) => { rawMap[i] = f.options.join("\n"); });
                    setOptionsRaw(rawMap);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, [handle]);

    const addField = () => {
        setFields(prev => {
            const newIndex = prev.length;
            setOptionsRaw(r => ({ ...r, [newIndex]: "" }));
            return [...prev, { label: "", type: "text", required: false, options: [], order: newIndex }];
        });
    };

    const removeField = (index: number) => {
        setFields(prev => prev.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })));
        setOptionsRaw(prev => {
            const next: Record<number, string> = {};
            Object.entries(prev).forEach(([k, v]) => {
                const n = Number(k);
                if (n < index) next[n] = v;
                else if (n > index) next[n - 1] = v;
            });
            return next;
        });
    };

    const updateField = (index: number, updates: Partial<FormField>) => {
        if ("type" in updates) {
            setOptionsRaw(prev => ({ ...prev, [index]: "" }));
        }
        setFields(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
    };

    const moveField = (index: number, direction: "up" | "down") => {
        const newFields = [...fields];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newFields.length) return;
        [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
        setFields(newFields.map((f, i) => ({ ...f, order: i })));
        setOptionsRaw(prev => {
            const next = { ...prev };
            [next[index], next[targetIndex]] = [next[targetIndex] ?? "", next[index] ?? ""];
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        setSaved(false);
        try {
            const res = await fetch(`/api/creators/${handle}/inquiry-settings`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inquiryEnabled, fields }),
            });
            if (res.ok) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center">
                <p className="text-white/40">読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#1a1a1a] text-white p-6 max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link
                    href={`/creators/${handle}/inquiries`}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                >
                    ← お問い合わせ
                </Link>
                <span className="text-white/20">/</span>
                <h1 className="text-xl font-bold">フォーム設定</h1>
            </div>

            {/* Enable toggle */}
            <div className="bg-white/5 rounded-2xl p-5 mb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium">お問い合わせフォームを有効にする</p>
                        <p className="text-sm text-white/50 mt-0.5">
                            無効にするとファンページにフォームが表示されなくなります
                        </p>
                    </div>
                    <button
                        onClick={() => setInquiryEnabled(v => !v)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            inquiryEnabled ? "bg-blue-500" : "bg-white/20"
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                inquiryEnabled ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* Default fields notice */}
            <div className="bg-white/5 rounded-2xl p-5 mb-4">
                <p className="text-sm font-medium mb-2">デフォルト項目（常に表示）</p>
                <div className="space-y-2">
                    {[
                        { label: "お名前", note: "必須" },
                        { label: "メールアドレス", note: "必須" },
                        { label: "メッセージ", note: "必須" },
                    ].map(f => (
                        <div key={f.label} className="flex items-center justify-between px-3 py-2 bg-white/5 rounded-lg">
                            <span className="text-sm">{f.label}</span>
                            <span className="text-xs text-white/40">{f.note}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom fields */}
            <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                    <p className="font-medium text-sm">追加項目</p>
                    <button
                        onClick={addField}
                        className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors"
                    >
                        + 項目を追加
                    </button>
                </div>

                {fields.length === 0 ? (
                    <p className="text-sm text-white/30 py-4 text-center bg-white/5 rounded-xl">
                        追加項目はありません
                    </p>
                ) : (
                    <div className="space-y-3">
                        {fields.map((field, index) => (
                            <div key={index} className="bg-white/5 rounded-xl p-4">
                                {/* Field header */}
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex flex-col gap-0.5">
                                        <button
                                            onClick={() => moveField(index, "up")}
                                            disabled={index === 0}
                                            className="text-white/30 hover:text-white disabled:opacity-20 text-xs leading-none"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => moveField(index, "down")}
                                            disabled={index === fields.length - 1}
                                            className="text-white/30 hover:text-white disabled:opacity-20 text-xs leading-none"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                    <span className="text-xs text-white/30">#{index + 1}</span>
                                    <button
                                        onClick={() => removeField(index)}
                                        className="ml-auto text-red-400/60 hover:text-red-400 text-xs"
                                    >
                                        削除
                                    </button>
                                </div>

                                {/* Label */}
                                <div className="mb-3">
                                    <label className="text-xs text-white/40 mb-1 block">ラベル</label>
                                    <input
                                        type="text"
                                        value={field.label}
                                        onChange={e => updateField(index, { label: e.target.value })}
                                        placeholder="例: お問い合わせ種別"
                                        className="w-full bg-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white/15 placeholder:text-white/20"
                                    />
                                </div>

                                {/* Type */}
                                <div className="mb-3">
                                    <label className="text-xs text-white/40 mb-1 block">種別</label>
                                    <select
                                        value={field.type}
                                        onChange={e => updateField(index, { type: e.target.value as FieldType, options: [] })}
                                        className="w-full bg-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white/15"
                                    >
                                        {(Object.entries(fieldTypeLabels) as [FieldType, string][]).map(([val, label]) => (
                                            <option key={val} value={val} className="bg-[#2a2a2a]">{label}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Options for select / checkbox */}
                                {(field.type === "select" || field.type === "checkbox") && (
                                    <div className="mb-3">
                                        <label className="text-xs text-white/40 mb-1 block">
                                            {field.type === "checkbox" ? "チェックボックスの選択肢（1行1つ）" : "選択肢（1行1つ）"}
                                        </label>
                                        <textarea
                                            value={optionsRaw[index] ?? field.options.join("\n")}
                                            onChange={e => setOptionsRaw(prev => ({ ...prev, [index]: e.target.value }))}
                                            onBlur={e => updateField(index, {
                                                options: e.target.value.split("\n").filter(o => o.trim())
                                            })}
                                            placeholder={field.type === "checkbox" ? "同意する\n希望する" : "選択肢1\n選択肢2\n選択肢3"}
                                            rows={4}
                                            className="w-full bg-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:bg-white/15 placeholder:text-white/20 resize-none"
                                        />
                                    </div>
                                )}

                                {/* Required toggle */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateField(index, { required: !field.required })}
                                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                            field.required ? "bg-blue-500" : "bg-white/20"
                                        }`}
                                    >
                                        <span
                                            className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                                                field.required ? "translate-x-5" : "translate-x-1"
                                            }`}
                                        />
                                    </button>
                                    <span className="text-xs text-white/60">必須項目</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Save button */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl bg-white text-[#1a1a1a] font-semibold text-sm hover:bg-white/90 disabled:opacity-50 transition-colors"
                >
                    {saving ? "保存中..." : "保存する"}
                </button>
                {saved && (
                    <span className="text-sm text-green-400">保存しました</span>
                )}
            </div>
        </div>
    );
}
