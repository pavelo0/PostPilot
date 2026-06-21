import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../api/auth';
import { deletePost, listPosts, sendPostDescription } from '../../api/posts';

/**
 * Lists current user posts and allows basic actions.
 */
export function PostsListPage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);

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

  const sendDescriptionMutation = useMutation({
    mutationFn: sendPostDescription,
    onSuccess: (_result, postId) => {
      setSendError(null);
      setSendSuccess(`Post ${postId.slice(0, 6)}... sent to Telegram`);
    },
    onError: (error: Error) => {
      setSendSuccess(null);
      setSendError(error.message);
    },
  });

  /**
   * Deletes post and refreshes list.
   */
  async function handleDelete(postId: string): Promise<void> {
    await deleteMutation.mutateAsync(postId);
  }

  /**
   * Sends post body to connected Telegram channel.
   */
  async function handleSendDescription(postId: string): Promise<void> {
    setSendError(null);
    setSendSuccess(null);
    await sendDescriptionMutation.mutateAsync(postId);
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
            {sendError ? <p className="error">{sendError}</p> : null}
            {sendSuccess ? <p className="muted">{sendSuccess}</p> : null}
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
                    <small className="muted">Status: {post.status}</small>
                  </div>
                  <div className="posts-actions">
                    <button
                      type="button"
                      onClick={() => void handleSendDescription(post.id)}
                      disabled={sendDescriptionMutation.isPending}
                    >
                      {sendDescriptionMutation.isPending ? 'Sending...' : 'Send description'}
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
