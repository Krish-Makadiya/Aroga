import React, { useEffect, useRef, useState } from 'react';

import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@clerk/clerk-react';
import {
  Calendar,
  Edit3,
  Trash2,
  Pin,
  ThumbsUp,
} from 'lucide-react';

const typeMeta = (type) => {
  switch (type) {
    case 'Announcement':
      return { emoji: '📢', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' };
    case 'Alert':
      return { emoji: '🚨', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' };
    default:
      return { emoji: '📝', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' };
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
};

export default function PostCard({
  post,
  showAuthor = false,
  showActions = false,
  onEdit,
  onDelete,
}) {
  const meta = typeMeta(post.type);
  const { userId, getToken } = useAuth();
  const [likeCount, setLikeCount] = useState(typeof post.likes === 'number' ? post.likes : 0);
  const [liked, setLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const clickLockRef = useRef(false);

  useEffect(() => {
    let initialLiked = false;
    if (typeof post.isLiked === 'boolean') {
      initialLiked = post.isLiked;
    } else if (Array.isArray(post.likedBy) && userId) {
      initialLiked = post.likedBy.some((entry) => {
        const val = typeof entry === 'object' && entry !== null ? (entry._id || entry.id || entry) : entry;
        return String(val) === String(userId);
      });
    }
    setLiked(initialLiked);
    setLikeCount(typeof post.likes === 'number' ? post.likes : 0);
  }, [post._id, post.likes, post.isLiked, post.likedBy, userId]);

  const handleThumbToggle = async () => {
    if (likeLoading || clickLockRef.current) return;
    clickLockRef.current = true;
    const previousLiked = liked;
    const previousCount = likeCount;
    try {
      setLikeLoading(true);
      const token = await getToken();
      // If no token, do not proceed
      if (!token) {
        return;
      }
      // optimistic update after confirming we can call API
      setLiked(!previousLiked);
      setLikeCount(previousLiked ? Math.max(0, previousCount - 1) : previousCount + 1);

      if (!previousLiked) {
        const res = await axios.put(
          `http://localhost:5000/api/articles/${post._id}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newLikes = res?.data?.likes;
        if (typeof newLikes === 'number') setLikeCount(newLikes);
      } else {
        const res = await axios.put(
          `http://localhost:5000/api/articles/${post._id}/unlike`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newLikes = res?.data?.likes;
        if (typeof newLikes === 'number') setLikeCount(newLikes);
      }
    } catch (e) {
      setLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setLikeLoading(false);
      clickLockRef.current = false;
    }
  };

  return (
    <div className="bg-light-surface dark:bg-dark-bg rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        {showAuthor ? (
          <div className="flex items-center gap-3 mb-3">
            <div className={`px-2 py-0.5 rounded text-xs font-medium ${meta.bg} ${meta.text}`}>
              {post.type}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-light-primary-text dark:text-dark-primary-text truncate">
                {post.authorId?.fullName ? `Dr. ${post.authorId.fullName}` : 'Dr. Unknown'}
              </h4>
            </div>
            <div className="ml-auto">
              {post.isPinned && <Pin className="w-4 h-4 text-light-primary dark:text-dark-primary" />}
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-end mb-3">
            <div className="flex items-center gap-1">
              {post.isPinned && <Pin className="w-4 h-4 text-light-primary dark:text-dark-primary" />}
              {showActions && (
                <>
                  <button
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => onEdit && onEdit(post)}
                    aria-label="Edit post"
                  >
                    <Edit3 className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => onDelete && onDelete(post._id)}
                    aria-label="Delete post"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg md:text-xl font-bold text-light-primary-text dark:text-dark-primary-text mb-2 line-clamp-2 leading-tight">
          <span className="mr-2">{meta.emoji}</span>
          {post.title}
        </h3>

        {/* Optional subtitle */}
        {post.subtitle && (
          <p className="text-sm text-light-secondary-text dark:text-dark-secondary-text mb-3 line-clamp-2">
            {post.subtitle}
          </p>
        )}

        {/* Content excerpt */}
        {post.content && (
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 leading-relaxed">
            {post.content.length > 220 ? `${post.content.slice(0, 220)}...` : post.content}
          </p>
        )}

        {/* Read more near main title/content */}
        <div className="mb-2">
          <Link
            to={`/community/post/${post._id}`}
            className="text-sm font-medium text-light-primary dark:text-dark-primary hover:underline"
          >
            Read more
          </Link>
        </div>

        {/* Thumbs up below Read more */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleThumbToggle}
            disabled={likeLoading}
            className={`inline-flex items-center gap-2 text-sm rounded px-2 py-1 transition-colors ${
              liked
                ? 'text-light-primary dark:text-dark-primary'
                : 'text-gray-600 dark:text-gray-300 hover:text-light-primary dark:hover:text-dark-primary'
            }`}
            aria-label={liked ? 'Unlike' : 'Like'}
            aria-pressed={liked}
            title={liked ? 'Unlike' : 'Like'}
          >
            <ThumbsUp className="w-4 h-4" fill={liked ? 'currentColor' : 'none'} />
            <span className="text-xs opacity-80">{likeCount}</span>
          </button>
        </div>

        {/* Date */}
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>
            {post.publishedAt
              ? `Published ${formatDate(post.publishedAt)}`
              : `Created ${formatDate(post.createdAt)}`}
          </span>
        </div>
      </div>
    </div>
  );
}