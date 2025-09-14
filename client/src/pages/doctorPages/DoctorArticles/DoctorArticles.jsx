import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import AllArticles from "./AllArticles";
import MyArticles from "./MyArticles";

const DoctorArticles = ({ tabs }) => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("all-articles");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <div className="flex relative">
            <Sidebar tabs={tabs} getActiveTab={() => activeTab} />
            <div className="min-h-screen w-full bg-light-bg dark:bg-dark-surface md:py-8 md:px-5 py-5">
                <div className="mb-4 flex gap-4 border-b border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20">
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                            activeTab === "all-articles"
                                ? "bg-[var(--color-light-primary)] text-white dark:bg-[var(--color-dark-primary)]"
                                : "bg-transparent text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                        }`}
                        onClick={() => setActiveTab("all-articles")}
                    >
                        All Articles
                    </button>
                    <button
                        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${
                            activeTab === "my-articles"
                                ? "bg-[var(--color-light-primary)] text-white dark:bg-[var(--color-dark-primary)]"
                                : "bg-transparent text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                        }`}
                        onClick={() => setActiveTab("my-articles")}
                    >
                        My Articles
                    </button>
                </div>
                {loading ? (
                    <div className="p-6">Loading appointments…</div>
                ) : error ? (
                    <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
                ) : (
                    <>
                        {activeTab === "all-articles" && <AllArticles />}
                        {activeTab === "my-articles" && <MyArticles />}
                    </>
                )}
            </div>
        </div>
    );
};

export default DoctorArticles;
