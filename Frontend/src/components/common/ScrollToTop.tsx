import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Only scroll to top on specific routes, not all navigation
    const shouldScrollToTop = [
      '/',
      '/auth/login',
      '/auth/register',
      '/listings',
      '/category-selection'
    ].some(route => pathname === route || pathname.startsWith('/listing/'));

    if (shouldScrollToTop) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
