import type { ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';

/**
 * Wraps public pages with landing header and container.
 */
export default function LandingLayout(): ReactElement {
  return (
    <div className="layout layout--landing">
      <Header mode="landing" />
      <main className="layout__content layout__content--landing">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}