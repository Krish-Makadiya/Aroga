import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Plus, X, Save, ArrowLeft } from "lucide-react";
import React, { useState } from "react";

const CreateArticleButton = ({ onArticleCreated }) => {
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { user } = useUser();
    const { getToken } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        content: '',
        category: '',
        isPinned: false
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const token = await getToken();
            const articleData = {
                authorClerkId: user.id,
                title: formData.title,
                subtitle: formData.subtitle,
                content: formData.content,
                category: formData.category,
                isPinned: formData.isPinned
            };

            const response = await axios.post(
                'http://localhost:5000/api/articles',
                articleData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Article created:', response.data);
            alert('Article created successfully!');

            // Reset form
            setFormData({
                title: '',
                subtitle: '',
                content: '',
                category: '',
                isPinned: false
            });

            setIsEditorOpen(false);

            // Callback to refresh articles list
            if (onArticleCreated) {
                onArticleCreated();
            }
        } catch (error) {
            console.error('Error creating article:', error);
            alert('Failed to create article. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            title: '',
            subtitle: '',
            content: '',
            category: '',
            isPinned: false
        });
        setIsEditorOpen(false);
    };

    if (isEditorOpen) {
        return (
            <div
                className="fixed inset-0 bg-light-surface dark:bg-dark-bg z-50 overflow-y-auto"
                style={{
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    WebkitScrollbar: { display: 'none' }
                }}>
                {/* Header */}
                <div className="sticky top-0 bg-light-surface dark:bg-dark-bg border-b border-light-bg dark:border-dark-surface px-4 py-3">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCancel}
                                className="p-2 hover:bg-light-border dark:hover:bg-dark-border rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-light-primary dark:text-dark-primary" />
                            </button>
                            <h1 className="text-lg font-medium text-light-primary-text dark:text-dark-primary-text">
                                Write your story
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading || !formData.title.trim() || !formData.content.trim()}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-full text-sm font-medium transition-colors disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Publishing...' : 'Publish'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Editor Content */}
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        {/* Title */}
                        <textarea
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Title"
                            className="w-full text-4xl md:text-5xl font-bold text-light-primary-text dark:text-dark-primary-text placeholder-light-secondary-text/50 dark:placeholder-dark-secondary-text/50 bg-transparent border-none outline-none resize-none overflow-hidden leading-tight mb-2"
                            style={{ minHeight: '60px' }}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />

                        {/* Subtitle */}
                        <textarea
                            name="subtitle"
                            value={formData.subtitle}
                            onChange={handleChange}
                            placeholder="Tell your story..."
                            className="w-full text-xl md:text-2xl text-light-primary-text dark:text-dark-primary-text placeholder-light-secondary-text/50 dark:placeholder-dark-secondary-text/50 bg-transparent border-none outline-none resize-none overflow-hidden leading-relaxed mb-8"
                            style={{ minHeight: '40px' }}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />

                        {/* Category Selection */}
                        <div className="mb-8">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="py-2 pl-2 pr-2 rounded-md bg-light-surface dark:bg-dark-surface text-light-primary-text dark:text-dark-primary-text text-sm"
                            >
                                <option value="">Select a category</option>
                                <option value="General Health">General Health</option>
                                <option value="Cardiology">Cardiology</option>
                                <option value="Neurology">Neurology</option>
                                <option value="Pediatrics">Pediatrics</option>
                                <option value="Dermatology">Dermatology</option>
                                <option value="Orthopedics">Orthopedics</option>
                                <option value="Mental Health">Mental Health</option>
                                <option value="Nutrition">Nutrition</option>
                                <option value="Preventive Care">Preventive Care</option>
                                <option value="Emergency Medicine">Emergency Medicine</option>
                            </select>
                        </div>

                        {/* Content */}
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            placeholder="Write your article..."
                            className="w-full text-lg text-light-primary-text dark:text-dark-primary-text placeholder-light-secondary-text/50 dark:placeholder-dark-secondary-text/50 bg-transparent border-none outline-none resize-none leading-relaxed"
                            style={{ minHeight: '400px' }}
                            onInput={(e) => {
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                        />

                        {/* Pin Option */}
                        <div className="flex items-center gap-2 mt-8 pt-8 border-t border-light-border dark:border-dark-border">
                            <input
                                type="checkbox"
                                name="isPinned"
                                checked={formData.isPinned}
                                onChange={handleChange}
                                className="w-4 h-4 text-green-600 bg-light-surface dark:bg-dark-bg border-light-border dark:border-dark-border rounded"
                            />
                            <label className="text-sm text-light-secondary-text dark:text-dark-secondary-text">
                                Pin this article
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsEditorOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded-lg hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-light-primary dark:focus:ring-dark-primary focus:ring-offset-2"
        >
            <Plus className="w-4 h-4" />
            Create New Article
        </button>
    );
};

export default CreateArticleButton;