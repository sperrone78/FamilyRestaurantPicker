import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { RestaurantComment, CreateCommentRequest, UpdateCommentRequest } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { commentsService } from '../services/firestore';

interface RestaurantCommentsProps {
  restaurantId: string;
}

export default function RestaurantComments({ restaurantId }: RestaurantCommentsProps) {
  const [comments, setComments] = useState<RestaurantComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    loadComments();
  }, [restaurantId, user]);

  const loadComments = async () => {
    if (!user) return;
    
    try {
      const restaurantComments = await commentsService.getRestaurantComments(restaurantId, user.uid);
      setComments(restaurantComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setSubmitting(true);
    try {
      const commentData: CreateCommentRequest = {
        restaurantId,
        content: newComment.trim()
      };

      const comment = await commentsService.addComment(user.uid, commentData);
      setComments([comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = (commentId: string, currentContent: string) => {
    setEditingComment(commentId);
    setEditingContent(currentContent);
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editingContent.trim()) return;

    setSubmitting(true);
    try {
      const updateData: UpdateCommentRequest = {
        content: editingContent.trim()
      };

      const updatedComment = await commentsService.updateComment(commentId, updateData);
      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      setEditingComment(null);
      setEditingContent('');
    } catch (error) {
      console.error('Error updating comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentsService.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditingContent('');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Your Comments</h4>
      
      {/* Add Comment Form */}
      <form onSubmit={handleAddComment} className="space-y-3">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment about this restaurant..."
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          maxLength={500}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {newComment.length}/500 characters
          </span>
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? 'Adding...' : 'Add Comment'}
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm italic">No comments yet. Be the first to add one!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <span className="text-sm text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                    {comment.updatedAt !== comment.createdAt && (
                      <span className="text-xs text-gray-400 ml-2">(edited)</span>
                    )}
                  </span>
                </div>
                {comment.userId === user?.uid && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditComment(comment.id, comment.content)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              
              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {editingContent.length}/500 characters
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateComment(comment.id)}
                        disabled={!editingContent.trim() || submitting}
                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {submitting ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p 
                  className="text-gray-700 whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(comment.content, { 
                      ALLOWED_TAGS: [],
                      ALLOWED_ATTR: [] 
                    })
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}