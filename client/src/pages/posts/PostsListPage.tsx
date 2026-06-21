import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';
import { deletePost, listPosts, publishPost } from '../../api/posts';
import type { PostItem } from '../../types/posts';

/**
 * Lists current user posts and allows basic actions.
 */
export function PostsListPage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [activePublishPostId, setActivePublishPostId] = useState<string | null>(null);

  const postsQuery = useQuery({
    queryKey: ['posts'],
    queryFn: listPosts,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await navigate('/login');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishPost,
    onSuccess: async (post) => {
      setPublishError(null);
      setPublishSuccess(`Post "${post.title ?? 'Untitled draft'}" published`);
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (error: Error) => {
      setPublishSuccess(null);
      setPublishError(error.message);
    },
    onSettled: () => {
      setActivePublishPostId(null);
    },
  });

  /**
   * Deletes post and refreshes list.
   */
  async function handleDelete(postId: string): Promise<void> {
    await deleteMutation.mutateAsync(postId);
  }

  /**
   * Publishes post body to connected Telegram channel.
   */
  async function handlePublish(post: PostItem): Promise<void> {
    const shouldPublish = window.confirm(
      `Publish "${post.title ?? 'Untitled draft'}" to Telegram now?`,
    );

    if (!shouldPublish) {
      return;
    }

    setPublishError(null);
    setPublishSuccess(null);
    setActivePublishPostId(post.id);
    await publishMutation.mutateAsync(post.id);
  }

  /**
   * Logs user out and redirects to login.
   */
  async function handleLogout(): Promise<void> {
    await logoutMutation.mutateAsync();
  }

  if (postsQuery.isLoading) {
    return <p className="centered-message">Loading posts...</p>;
  }

  if (postsQuery.isError) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Posts</h1>
          <p className="error">Failed to load posts.</p>
        </section>
      </main>
    );
  }

  const posts = postsQuery.data ?? [];

  return (
    <main className="auth-page">
      <section className="auth-card posts-card">
        <div className="posts-header">
          <h1>Your posts</h1>
          <div className="posts-actions">
            <Link className="ghost-link" to="/app/channel">
              Channel
            </Link>
            <Link className="ghost-link" to="/app/posts/new">
              New post
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
            >
              {logoutMutation.isPending ? 'Signing out...' : 'Logout'}
            </button>
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="muted">No posts yet. Create your first draft.</p>
        ) : (
          <>
            {publishError ? <p className="error">{publishError}</p> : null}
            {publishSuccess ? <p className="muted">{publishSuccess}</p> : null}
            <ul className="posts-list">
              {posts.map((post) => (
                <li key={post.id} className="post-item">
                  <div>
                    <h2>{post.title ?? 'Untitled draft'}</h2>
                    <p className="muted">
                      {post.body.length > 120
                        ? `${post.body.slice(0, 120)}...`
                        : post.body}
                    </p>
                    <small className={`status-badge status-${post.status}`}>
                      {post.status}
                    </small>
                    {post.publishedAt ? (
                      <p className="muted">
                        Published at: {new Date(post.publishedAt).toLocaleString()}
                      </p>
                    ) : null}
                    {post.telegramPostUrl ? (
                      <a
                        className="ghost-link"
                        href={post.telegramPostUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open in Telegram
                      </a>
                    ) : null}
                    {post.errorMessage ? (
                      <p className="error">Last publish error: {post.errorMessage}</p>
                    ) : null}
                  </div>
                  <div className="posts-actions">
                    <button
                      type="button"
                      onClick={() => void handlePublish(post)}
                      disabled={
                        publishMutation.isPending || deleteMutation.isPending
                      }
                    >
                      {publishMutation.isPending && activePublishPostId === post.id
                        ? 'Publishing...'
                        : 'Publish'}
                    </button>
                    <Link className="ghost-link" to={`/app/posts/${post.id}`}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDelete(post.id)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
