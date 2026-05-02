const TOKEN_KEY = 'qrmenu_token';
const USERNAME_KEY = 'qrmenu_user';
const ROLE_KEY = 'qrmenu_role';

export const setAuth = (token, username, role) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USERNAME_KEY, username);
  localStorage.setItem(ROLE_KEY, role);
};

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const getUsername = () => localStorage.getItem(USERNAME_KEY);
export const getRole = () => localStorage.getItem(ROLE_KEY);
export const isAuthenticated = () => !!getToken();

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
};
