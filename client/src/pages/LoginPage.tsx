import type { FormEvent, ReactElement } from 'react';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLoginMutation } from '../store/api';
import { getApiErrorMessage } from '../store/error';

/**
 * Login form page for existing users.
 */
export function LoginPage(): ReactElement {
  const navigate = useNavigate();
  const [triggerLogin, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  /**
   * Submits login credentials to API.
   */
  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);
    try {
      await triggerLogin({ email, password }).unwrap();
      await navigate('/app');
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <h1>Sign in</h1>
        <p className="muted">Use your PostPilot account credentials.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {formError ? <p className="error">{formError}</p> : null}

          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
        <p className="muted">
          No account yet? <Link to="/register">Create one</Link>.
        </p>
      </section>
    </main>
  );
}
