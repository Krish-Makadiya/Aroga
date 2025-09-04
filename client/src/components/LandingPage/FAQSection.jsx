import { useState } from "react";

const faqs = [
    {
        question: "How do I book a consultation with a doctor?",
        answer: "Simply sign in, choose your preferred doctor or specialty, and select an available time slot to book your consultation.",
    },
    {
        question: "Is my medical data secure on Arogya?",
        answer: "Yes, all your health records and personal data are encrypted and stored securely, accessible only by you and your authorized doctors.",
    },
    {
        question: "Can I get a digital prescription after my consultation?",
        answer: "Absolutely! After your consultation, your doctor can issue a secure digital prescription directly in the app.",
    },
    {
        question: "How does the AI symptom checker work?",
        answer: "Our AI symptom checker analyzes your symptoms using advanced algorithms to provide possible causes and suggest next steps.",
    },
    {
        question: "Can I access my health records anytime?",
        answer: "Yes, you can view, download, and share your health records securely from your profile at any time.",
    },
    {
        question: "What should I do in case of a medical emergency?",
        answer: "For emergencies, use the 24/7 emergency support feature in the app or call your local emergency number immediately.",
    },
];

export default function FAQSection() {
    const [openIndex, setOpenIndex] = useState(null);

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx);
    };

    return (
        <section className="bg-light-surface dark:bg-dark-surface py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mx-auto max-w-5xl text-center">
                    <h2 className="text-base/7 font-semibold text-light-primary dark:text-dark-primary">
                        FAQ's
                    </h2>
                    <p className="mx-auto mt-2 max-w-lg text-center text-4xl font-semibold tracking-tight text-balance text-light-primary-text dark:text-dark-primary-text sm:text-5xl">
                        Find answers to your questions
                    </p>
                </div>
                <div className="divide-y divide-light-secondary/30 dark:divide-dark-secondary/30 mt-10">
                    {faqs.map((faq, idx) => (
                        <div key={faq.question}>
                            <button
                                className="w-full flex items-center justify-between py-5 text-left focus:outline-none"
                                onClick={() => toggle(idx)}
                                aria-expanded={openIndex === idx}
                                aria-controls={`faq-answer-${idx}`}>
                                <span className="font-semibold font-sans text-lg text-light-primary-text dark:text-dark-primary-text">
                                    {faq.question}
                                </span>
                                <span
                                    className="ml-4 flex-shrink-0 text-light-primary-text dark:text-dark-primary-text text-2xl transition-transform duration-200"
                                    aria-hidden="true">
                                    {openIndex === idx ? (
                                        <span className="inline-block rotate-180 transition-transform">
                                            -
                                        </span>
                                    ) : (
                                        <span className="inline-block transition-transform">
                                            +
                                        </span>
                                    )}
                                </span>
                            </button>
                            <div
                                id={`faq-answer-${idx}`}
                                className={`overflow-hidden transition-all duration-300 ${
                                    openIndex === idx
                                        ? "max-h-40 opacity-100"
                                        : "max-h-0 opacity-0"
                                }`}>
                                <p className="text-light-secondary-text dark:text-dark-secondary-text font-sans text-base pb-5 pr-2 pl-1">
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
