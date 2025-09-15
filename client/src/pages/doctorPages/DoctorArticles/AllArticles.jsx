import React, { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import {
    Calendar,
    Eye,
    Heart,
    MessageCircle,
    Bookmark,
    Pin,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    User,
    Stethoscope,
    GraduationCap,
    MapPin
} from 'lucide-react';

const AllArticles = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useUser();
    const { getToken } = useAuth();

    useEffect(() => {
        if (user?.id) {
            fetchAllArticles();
        }
    }, [user]);

    const fetchAllArticles = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const response = await axios.get(
                `http://localhost:5000/api/articles/exclude/${user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                setArticles(response.data.data.articles);
            }
        } catch (err) {
            console.error('Error fetching articles:', err);
            setError('Failed to load articles');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'published':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'draft':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'review':
                return <AlertCircle className="w-4 h-4 text-blue-500" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'published':
                return 'Published';
            case 'draft':
                return 'Draft';
            case 'review':
                return 'Under Review';
            case 'rejected':
                return 'Rejected';
            default:
                return 'Unknown';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const truncateContent = (content, maxLength = 200) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    if (loading) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="bg-light-surface dark:bg-dark-bg rounded-lg p-6 shadow-sm">
                                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                                    <div className="space-y-2">
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Error Loading Articles
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                        <button
                            onClick={fetchAllArticles}
                            className="px-4 py-2 bg-light-primary dark:bg-dark-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-light-primary-text dark:text-dark-primary-text mb-2">
                        All Articles
                    </h1>
                    <p className="text-light-secondary-text dark:text-dark-secondary-text">
                        Discover articles from medical professionals around the platform
                    </p>
                </div>

                {/* Articles Grid */}
                {articles.length === 0 ? (
                    <div className="text-center py-12">
                        <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            No Articles Available
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            There are currently no articles from other doctors to display
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {articles.map((article) => (
                            <div
                                key={article._id}
                                className="bg-light-surface dark:bg-dark-bg rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100 dark:border-gray-700"
                            >
                                {/* Article Content */}
                                <div className="p-6">
                                    {/* Status and Pin */}
                                    <div className="flex items-start justify-between mb-4">
                                        {article.isPinned && (
                                            <Pin className="w-4 h-4 text-light-primary dark:text-dark-primary" />
                                        )}
                                    </div>

                                    {/* Title and Subtitle */}
                                    <h3 className="text-xl font-bold text-light-primary-text dark:text-dark-primary-text mb-2 line-clamp-2 leading-tight">
                                        {article.title}
                                    </h3>
                                    {article.subtitle && (
                                        <p className="text-base text-light-secondary-text dark:text-dark-secondary-text mb-3 line-clamp-1">
                                            {article.subtitle}
                                        </p>
                                    )}

                                    {/* Content Preview */}
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
                                        {article.content}
                                    </p>

                                    {/* Category */}
                                    <div className="mb-4">
                                        <span className="inline-block px-3 py-1 bg-light-primary/10 dark:bg-dark-primary/10 text-light-primary dark:text-dark-primary text-xs font-medium rounded-full">
                                            {article.category}
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Eye className="w-4 h-4" />
                                                <span>{article.views}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Heart className="w-4 h-4" />
                                                <span>{article.likes}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <MessageCircle className="w-4 h-4" />
                                                <span>{article.comments}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Bookmark className="w-4 h-4" />
                                                <span>{article.bookmarks}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Author Information */}
                                    <div className="mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-light-primary/10 dark:bg-dark-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                                {article.authorAvatar ? (
                                                    <img
                                                        src={article.authorAvatar}
                                                        alt={article.authorId?.fullName}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <User className="w-5 h-5 text-light-primary dark:text-dark-primary" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text truncate">
                                                    {article.authorId?.fullName || 'Unknown Author'}
                                                </h4>
                                                {article.authorId?.qualification && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <GraduationCap className="w-3 h-3 text-gray-500" />
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {article.authorId.qualification}
                                                        </span>
                                                    </div>
                                                )}
                                                {article.authorId?.specialty && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <Stethoscope className="w-3 h-3 text-gray-500" />
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {article.authorId.specialty}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <Calendar className="w-3 h-3" />
                                        <span>
                                            {article.publishedAt
                                                ? `Published ${formatDate(article.publishedAt)}`
                                                : `Created ${formatDate(article.createdAt)}`
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllArticles;