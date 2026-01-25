// lib/auth.js

/**
 * Check if user is authenticated (client-side only)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isAdmin') === 'true';
};

/**
 * Get authenticated admin user data
 * @returns {object|null}
 */
export const getAdminUser = () => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('admin_user');
  return user ? JSON.parse(user) : null;
};

/**
 * Set admin authentication
 * @param {string} username
 */
export const setAuth = (username) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('isAdmin', 'true');
  localStorage.setItem('admin_user', JSON.stringify({ username }));
};

/**
 * Clear admin authentication and redirect to login
 */
export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('admin_user');
  window.location.href = '/admin-login';
};

/**
 * Protect route - redirect to login if not authenticated
 * Call this in useEffect on protected pages
 */
export const requireAuth = () => {
  if (typeof window === 'undefined') return;
  
  if (!isAuthenticated()) {
    window.location.href = '/admin-login';
  }
};

/**
 * Check if already logged in - redirect to dashboard
 * Call this in useEffect on login page
 */
export const redirectIfAuthenticated = () => {
  if (typeof window === 'undefined') return;
  
  if (isAuthenticated()) {
    window.location.href = '/admin/dashboard';
  }
};
