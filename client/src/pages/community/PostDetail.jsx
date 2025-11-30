import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { Calendar, Loader2 } from "lucide-react";

const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    } catch {
        return "";
    }
};

export default function PostDetail() {
    const { id } = useParams();
    const { getToken } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            const res = await axios.get(
                `http://localhost:5000/api/articles/${id}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.data.success) {
                setPost(res.data.data);
            } else {
                setError("Post not found");
            }
        } catch (err) {
            console.error("Failed to load post", err);
            setError("Failed to load post");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }
    if (error || !post) {
        return (
            <div className="min-h-screen p-6 text-center">
                <p className="text-red-500">{error || "Post not found"}</p>
            </div>
        );
    }

    const emoji =
        post.type === "Announcement"
            ? "📢"
            : post.type === "Alert"
            ? "🚨"
            : "📝";

    return (
        <div className="min-h-screen p-6 bg-light-surface dark:bg-dark-bg">
            <div className="max-w-4xl mx-auto bg-light-surface dark:bg-dark-bg rounded-lg shadow-sm p-6">
                <div className="mb-4">
                    <div className="inline-flex items-center gap-2 text-xs px-2 py-1 rounded bg-light-bg dark:bg-dark-surface">
                        <span className="text-light-primary-text dark:text-dark-primary-text">{post.type}</span>
                    </div>
                </div>
                <h1 className="text-3xl font-bold mb-2 text-light-primary-text dark:text-dark-primary-text">
                    {emoji} {post.title}
                </h1>
                <div className="text-sm text-light-secondary-text dark:text-dark-secondary-text flex items-center gap-2 mb-6">
                    <Calendar className="w-4 h-4" />
                    <span>
                        {post.publishedAt
                            ? `Published ${formatDate(post.publishedAt)}`
                            : `Created ${formatDate(post.createdAt)}`}
                    </span>
                    <span>•</span>
                    <span>
                        {post.authorId?.fullName
                            ? `Dr. ${post.authorId.fullName}`
                            : "Dr. Unknown"}
                    </span>
                </div>
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap leading-relaxed text-light-primary-text dark:text-dark-primary-text">
                    {post.content}
                </div>
            </div>
        </div>
    );
}
