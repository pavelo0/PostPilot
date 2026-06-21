import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FormEvent, ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createPost, getPost, updatePost } from '../../api/posts';

/**
 * Provides create/edit form for post drafts.
 */
export function PostEditorPage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { postId } = useParams<{ postId: string }>();
  const isCreateMode = !postId;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const postQuery = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => getPost(postId!),
    enabled: !isCreateMode && Boolean(postId),
  });

  useEffect(() => {
    if (!postQuery.data) {
      return;
    }
    setTitle(postQuery.data.title ?? '');
    setBody(postQuery.data.body);
  }, [postQuery.data]);

  const createMutation = useMutation({
    mutationFn: createPost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      await navigate('/app/posts');
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () =>
      updatePost(postId!, {
        title,
        body,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['posts'] });
      await queryClient.invalidateQueries({ queryKey: ['post', postId] });
      await navigate('/app/posts');
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  /**
   * Submits create or update request.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);

    if (isCreateMode) {
      await createMutation.mutateAsync({
        title,
        body,
      });
      return;
    }

    await updateMutation.mutateAsync();
  }

  if (postQuery.isLoading) {
    return <p className="centered-message">Loading post...</p>;
  }

  if (postQuery.isError) {
    return (
      <main className="auth-page">
        <section className="auth-card">
          <h1>Post editor</h1>
          <p className="error">Unable to load post.</p>
          <Link to="/app/posts">Back to list</Link>
        </section>
      </main>
    );
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <main className="auth-page">
      <section className="auth-card posts-card">
        <h1>{isCreateMode ? 'Create draft' : 'Edit draft'}</h1>
        <p className="muted">Keep it simple: title is optional, body is required.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="post-title">Title (optional)</label>
          <input
            id="post-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={120}
          />

          <label htmlFor="post-body">Body</label>
          <textarea
            id="post-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={8}
            required
          />

          {formError ? <p className="error">{formError}</p> : null}

          <div className="posts-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : isCreateMode
                  ? 'Create post'
                  : 'Save changes'}
            </button>
            <Link className="ghost-link" to="/app/posts">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
