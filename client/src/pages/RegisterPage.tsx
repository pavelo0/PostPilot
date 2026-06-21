import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { FormEvent, ReactElement } from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';

/**
 * Registration form page for new users.
 */
export function RegisterPage(): ReactElement {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      await navigate('/app');
    },
    onError: (error: Error) => {
      setFormError(error.message);
    },
  });

  /**
   * Submits registration data to API.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);
    await registerMutation.mutateAsync({ email, password });
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Create account</h1>
        <p className="muted">Start using PostPilot with one channel in Pre-MVP.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {formError ? <p className="error">{formError}</p> : null}

          <button type="submit" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <p className="muted">
          Already have an account? <Link to="/login">Sign in</Link>.
        </p>
      </section>
    </main>
  );
}
