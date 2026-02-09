'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
}

interface TaskCommentFeedProps {
  taskId: string;
}

export function TaskCommentFeed({ taskId }: TaskCommentFeedProps) {
  const t = useTranslations('tasks.comments');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${taskId}/comments`);
      if (!response.ok) throw new Error('Failed to fetch comments');

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error(t('loadCommentsFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });

      if (!response.ok) throw new Error('Failed to post comment');

      toast.success(t('success'));
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Failed to post comment:', error);
      toast.error(t('postCommentFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium flex items-center gap-2">
        <MessageSquare className="h-4 w-4" />
        {t('title')}
      </h3>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              {t('noComments')}
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-muted/50 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{comment.author.name}</span>
                    <span className="text-muted-foreground">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('placeholder')}
              rows={3}
              disabled={submitting}
            />
            <Button type="submit" size="sm" disabled={submitting || !newComment.trim()}>
              {submitting ? 'Posting...' : t('submit')}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
