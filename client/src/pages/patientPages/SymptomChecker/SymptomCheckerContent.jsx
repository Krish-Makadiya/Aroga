import React, { useMemo, useState } from "react";
import {
    Stethoscope,
    HeartPulse,
    AlertTriangle,
    Leaf,
    Pill,
    Clock,
    Mic,
    X,
    Plus,
    RefreshCcw,
    CheckCircle2,
    Languages,
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import toast from "react-hot-toast";
import AiHealthInsight from "../../../components/patient/AiHealthInsight";

const COMMON_SYMPTOMS = [
    "Fever",
    "Cough",
    "Headache",
    "Stomach Pain",
    "Cold/Flu",
    "Back Pain",
    "Fatigue",
    "Chest Pain",
    "Shortness of Breath",
    "Skin Rash",
    "Joint Pain",
    "Sore Throat",
    "Nausea",
    "Dizziness",
];

function SymptomTag({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-sm">
            {label}
            <button
                type="button"
                onClick={onRemove}
                className="hover:opacity-80"
                aria-label={`Remove ${label}`}>
                <X className="w-3.5 h-3.5" />
            </button>
        </span>
    );
}

const SymptomCheckerContent = () => {
    const [input, setInput] = useState("");
    const [symptoms, setSymptoms] = useState([]);
    const [language, setLanguage] = useState("en");
    const [recording, setRecording] = useState(false);
    const [aiInsight, setAiInsight] = useState(null);

    const user = useUser().user.unsafeMetadata.patientData;

    const canSubmit = useMemo(
        () => symptoms.length > 0 || input.trim().length > 0,
        [symptoms, input]
    );

    const addSymptom = (label) => {
        const normalized = label.trim();
        if (!normalized) return;
        setSymptoms((prev) =>
            prev.includes(normalized) ? prev : [...prev, normalized]
        );
        setInput("");
    };

    const removeSymptom = (label) => {
        setSymptoms((prev) => prev.filter((s) => s !== label));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addSymptom(input);
        }
    };

    const handleCommonClick = (label) => addSymptom(label);

    const handleClear = () => {
        setSymptoms([]);
        setInput("");
    };

    const calcAge = (d) => {
        const dobDate = new Date(d);
        const diff = Date.now() - dobDate.getTime();
        const ageDate = new Date(diff);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    const age = user.dob ? calcAge(user.dob) : "";

    const handleSubmit = async (e) => {
        e.preventDefault();

        const prompt = `
                You are an AI-based medical assistant (not a doctor) that helps users understand their health based on their symptoms and personal details.
                Your role is to analyze the input and provide clear, structured, and simple health insights.
                Always use non-technical, easy-to-understand language.

                ### User Input:
                - Full Name: ${user.fullName || "N/A"}
                - Date of Birth (DOB): ${user.dob || "N/A"} ${
            user.dob ? `→ Age: ${age}` : ""
        }
                - Gender: ${user.gender || "N/A"}
                - Previous Medical History: ${user.medicalHistory || "N/A"}
                - Reported Symptoms: ${
                    Array.isArray(symptoms) && symptoms.length
                        ? symptoms.join(", ")
                        : "N/A"
                }
                - Description of Feelings: ${input.trim() || "N/A"}

                ### Your Tasks:
                1. Health State Analysis: Provide an overall health condition assessment: Good / Mild / Moderate / Severe.
                2. Possible Diseases: List 2–4 possible conditions with a confidence percentage (e.g., Flu – 75%) and a short reason that matches the symptoms.
                3. Simple Remedies: Provide safe home remedies or lifestyle tips.
                4. OTC Medicine Suggestions: Suggest safe over-the-counter medicines (e.g., paracetamol, antihistamines) when appropriate.
                5. Urgent Care Alert: Clearly mention if symptoms indicate emergency medical attention is needed.
                6. Lifestyle Advice: Suggest general health-improving actions (hydration, rest, diet, exercise).
                7. Medical Disclaimer: Always end with: "This is not a medical diagnosis. Please consult a licensed doctor for professional advice."

                ### Output Format (JSON only):
                {
                "healthState": "Good | Mild | Moderate | Severe",
                "possibleDiseases": [
                    {
                    "name": "Disease Name",
                    "confidence": "75%",
                    "reason": "Explanation in simple words"
                    }
                ],
                "remedies": [
                    "Simple home remedy 1",
                    "Simple home remedy 2"
                ],
                "otcMedicines": [
                    "Medicine name with purpose"
                ],
                "urgentCare": "Yes/No, with explanation",
                "lifestyleAdvice": [
                    "Tip 1",
                    "Tip 2"
                ],
                "disclaimer": "This is not a medical diagnosis. Please consult a licensed doctor for professional advice."
                }
                `.trim();

        if (!canSubmit) return;

        await toast.promise(
            (async () => {
                try {
                    const res = await axios.get(
                        `http://localhost:5000/api/ai/generate-questions`,
                        {
                            params: { prompt },
                        }
                    );
                    console.log(res.data);
                    setAiInsight(res.data);

                    setInput("");
                    setSymptoms([]);

                    return res.data;
                } catch (e) {
                    console.log(e);
                }
            })(),
            {
                loading: "AI is analyzing your symptoms...",
                success: (data) =>
                    `Analysis complete! Found ${
                        data.possibleDiseases?.length || 0
                    } possible conditions.`,
                error: (err) => `Failed to analyze symptoms.`,
            }
        );
    };

    const toggleVoice = () => {
        // Simple demo: simulates starting/stopping voice capture
        setRecording((r) => !r);
    };

    return (
        <div className="w-full max-w-8xl mx-auto ">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Card */}
                <div className="lg:col-span-2 bg-[var(--color-light-surface)] dark:bg-[var(--color-dark-bg)] rounded-2xl shadow p-5">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <HeartPulse className="w-7 h-7 text-[var(--color-light-primary)] dark:text-[var(--color-dark-primary)]" />
                            <h3 className="font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                Describe your symptoms
                            </h3>
                        </div>
                        <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4 text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]" />
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="text-sm bg-transparent border rounded-lg px-2 py-1 border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                <option value="en">English</option>
                                <option value="hi">Hindi</option>
                                <option value="bn">Bengali</option>
                                <option value="te">Telugu</option>
                                <option value="ta">Tamil</option>
                            </select>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                rows={4}
                                placeholder="Describe how you feel or press Enter to add..."
                                className="w-full rounded-xl border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)] px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--color-light-primary)] dark:focus:ring-[var(--color-dark-primary)]"
                            />
                            <button
                                type="button"
                                onClick={toggleVoice}
                                className={`absolute right-3 bottom-3 p-2 rounded-lg transition ${
                                    recording
                                        ? "bg-red-100 text-red-600 dark:bg-red-900/30"
                                        : "bg-[var(--color-light-background)] dark:bg-[var(--color-dark-background)] text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]"
                                }`}
                                title="Voice Input"
                                aria-pressed={recording}>
                                <Mic className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Selected Symptoms */}
                        {(symptoms.length > 0 || input.trim()) && (
                            <div className="flex flex-wrap gap-2">
                                {symptoms.map((s) => (
                                    <SymptomTag
                                        key={s}
                                        label={s}
                                        onRemove={() => removeSymptom(s)}
                                    />
                                ))}
                                {input.trim() && (
                                    <button
                                        type="button"
                                        onClick={() => addSymptom(input)}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-sm hover:opacity-90">
                                        <Plus className="w-3.5 h-3.5" /> Add "
                                        {input.trim()}"
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="bg-[var(--color-light-surface)] dark:bg-[var(--color-dark-surface)] rounded-2xl  p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500" />
                                <h4 className="font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                    Common symptoms
                                </h4>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {COMMON_SYMPTOMS.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => handleCommonClick(s)}
                                        type="button"
                                        className="px-3 py-1.5 rounded-full  text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] hover:bg-[var(--color-light-bg)]/50 dark:hover:bg-[var(--color-dark-bg)]/50 bg-light-bg dark:bg-dark-bg text-sm">
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClear}
                                className="px-4 py-2 rounded-xl border border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20 text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] hover:bg-[var(--color-light-background)] dark:hover:bg-[var(--color-dark-background)]">
                                <RefreshCcw className="w-4 h-4 inline mr-2" />{" "}
                                Reset
                            </button>
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="px-4 py-2 rounded-xl bg-[var(--color-light-primary)] dark:bg-[var(--color-dark-primary)] text-white hover:bg-[var(--color-light-primary-dark)] dark:hover:bg-[var(--color-dark-primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed">
                                <CheckCircle2 className="w-4 h-4 inline mr-2" />{" "}
                                Check Health
                            </button>
                        </div>

                        {aiInsight && <AiHealthInsight aiInsight={aiInsight} />}
                    </form>
                </div>

                {/* Common Symptoms & Info */}
                <div className="space-y-6">
                    <div className="bg-[var(--color-light-surface)] dark:bg-[var(--color-dark-bg)] rounded-2xl shadow p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Pill className="w-5 h-5 text-fuchsia-600" />
                            <h4 className="font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                What you get
                            </h4>
                        </div>
                        <ul className="list-disc pl-5 text-sm text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)] space-y-1">
                            <li>
                                AI analysis: Good / Mild / Moderate / Severe
                            </li>
                            <li>Possible diseases with confidence score</li>
                            <li>
                                Simple remedies and OTC medicine suggestions
                            </li>
                            <li>
                                Accessible UI with large icons and clear
                                language
                            </li>
                        </ul>
                    </div>

                    <div className="bg-[var(--color-light-surface)] dark:bg-[var(--color-dark-bg)] rounded-2xl shadow p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <Leaf className="w-5 h-5 text-emerald-600" />
                            <h4 className="font-semibold text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]">
                                Accessibility
                            </h4>
                        </div>
                        <p className="text-sm text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                            Voice input, large icons, adjustable font size,
                            multilingual support.
                        </p>
                        <div className="flex items-center gap-2 text-xs mt-2 text-[var(--color-light-secondary-text)] dark:text-[var(--color-dark-secondary-text)]">
                            <Clock className="w-4 h-4" /> Results will appear in
                            the browser console after submitting.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SymptomCheckerContent;
