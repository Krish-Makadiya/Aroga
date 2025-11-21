import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import AllArticles from "./AllArticles";
import MyArticles from "./MyArticles";
import CreateArticleButton from "../../../components/Doctor/CreateArticleButton";

const DoctorArticles = ({ tabs }) => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState("all-articles");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleArticleCreated = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="flex relative">
            <Sidebar tabs={tabs} getActiveTab={() => activeTab} />
            <div className="min-h-screen w-full bg-light-bg dark:bg-dark-surface md:py-8 md:px-5 py-5">
                <div className="mb-4 flex justify-between gap-4 border-b border-[var(--color-light-secondary-text)]/20 dark:border-[var(--color-dark-secondary-text)]/20">
                    <div>
                        <button
                            className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${activeTab === "all-articles"
                                    ? "bg-[var(--color-light-primary)] text-white dark:bg-[var(--color-dark-primary)]"
                                    : "bg-transparent text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                                }`}
                            onClick={() => setActiveTab("all-articles")}
                        >
                            All Posts
                        </button>
                        <button
                            className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 focus:outline-none ${activeTab === "my-articles"
                                    ? "bg-[var(--color-light-primary)] text-white dark:bg-[var(--color-dark-primary)]"
                                    : "bg-transparent text-[var(--color-light-primary-text)] dark:text-[var(--color-dark-primary-text)]"
                                }`}
                            onClick={() => setActiveTab("my-articles")}
                        >
                            My Posts
                        </button>
                    </div>
                    <CreateArticleButton onArticleCreated={handleArticleCreated} />
                </div>
                {loading ? (
                    <div className="p-6">Loading appointments…</div>
                ) : error ? (
                    <div className="p-6 text-red-600 dark:text-red-400">{error}</div>
                ) : (
                    <>
                        {activeTab === "all-articles" && <AllArticles key={refreshTrigger} />}
                        {activeTab === "my-articles" && <MyArticles key={refreshTrigger} />}
                    </>
                )}
            </div>
        </div>
    );
};

export default DoctorArticles;
