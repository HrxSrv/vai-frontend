import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState } from '../types';
import { getStoredAuth, storeAuth, clearAuth } from '../utils/storage';
import api from '../services/api';

interface AuthContextType extends AuthState {
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const AuthContext = createContext<AuthContextType>({
  ...initialState,
  loginWithGoogle: async () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  useEffect(() => {
    const initAuth = async () => {
      const storedAuth = getStoredAuth();
      if (storedAuth && storedAuth.token) {
        try {
          api.setAuthToken(storedAuth.token);
          // Validate token with backend
          const response = await api.get('/auth/validate');
          if (response.data.success) {
            setAuthState({
              user: storedAuth.user,
              token: storedAuth.token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error('Token validation failed');
          }
        } catch (error) {
          console.log('Token validation failed:', error);
          clearAuth();
          api.clearAuthToken();
          setAuthState({ ...initialState, isLoading: false });
        }
      } else {
        setAuthState({ ...initialState, isLoading: false });
      }
    };
    initAuth();
  }, []);

  const loginWithGoogle = async (credential: string) => {
    try {
      const response = await api.post('/auth/google', { credential });
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Login failed');
      }

      const { token, user } = response.data;
      const authData = {
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      };
      
      api.setAuthToken(token);
      storeAuth(authData);
      setAuthState(authData);
    } catch (error: any) {
      clearAuth();
      api.clearAuthToken();
      setAuthState({ ...initialState, isLoading: false });
      
      // Provide more specific error messages
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Google login failed. Please try again.');
      }
    }
  };

  const logout = async () => {
    try {
      // Call backend logout if token exists
      if (authState.token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.log('Logout API call failed:', error);
      // Continue with local logout even if API fails
    } finally {
      api.clearAuthToken();
      clearAuth();
      setAuthState({ ...initialState, isLoading: false });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
