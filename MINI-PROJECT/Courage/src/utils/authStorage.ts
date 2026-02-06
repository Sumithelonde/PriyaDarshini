export const getToken = () => localStorage.getItem('auth_token');

export const setToken = (token: string) => localStorage.setItem('auth_token', token);

export const clearToken = () => localStorage.removeItem('auth_token');

export const getUser = () => {
  const raw = localStorage.getItem('auth_user');
  return raw ? JSON.parse(raw) : null;
};

export const setUser = (user: unknown) => {
  localStorage.setItem('auth_user', JSON.stringify(user));
};

export const clearUser = () => localStorage.removeItem('auth_user');

/**
 * Complete logout - clears all auth state from localStorage
 * Call this on logout success and token expiry
 */
export const signOut = () => {
  clearToken();
  clearUser();
  // Clear any other cached user data
  localStorage.removeItem('user_preferences');
  localStorage.removeItem('theme');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken() && !!getUser();
};

/**
 * Get user role safely
 */
export const getUserRole = (): string | null => {
  const user = getUser();
  return user?.role || null;
};

/**
 * Check if user has required role
 */
export const hasRole = (role: string | string[]): boolean => {
  const userRole = getUserRole();
  if (!userRole) return false;
  
  if (Array.isArray(role)) {
    return role.includes(userRole);
  }
  return userRole === role;
};
