import { defineStore } from "pinia";
import { computed, ref } from "vue";
import api from "@/services/api";
import type {
  AuthError,
  LoginCredentials,
  LoginResponse,
  User,
} from "@/types/Auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const isInitialized = ref(false);

  const isAuthenticated = computed(() => !!(token.value && user.value));
  const userRoles = computed(() => user.value?.roles || []);

  const setError = (message: string) => {
    error.value = message;
  };

  const clearError = () => {
    error.value = null;
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const setTokens = (authToken: string, refreshAuthToken: string) => {
    token.value = authToken;
    refreshToken.value = refreshAuthToken;

    localStorage.setItem("auth_token", authToken);
    localStorage.setItem("refresh_token", refreshAuthToken);

    api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
  };

  const clearTokens = () => {
    token.value = null;
    refreshToken.value = null;
    user.value = null;

    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");

    delete api.defaults.headers.common["Authorization"];
  };

  const fetchUserProfile = async (): Promise<User> => {
    try {
      const response = await api.get("/users/me");
      return response.data;
    } catch (err) {
      try {
        if (token.value) {
          const payload = JSON.parse(atob(token.value.split(".")[1]));
          return {
            id: payload.sub || payload.user_id,
            email: payload.username || payload.email,
            roles: payload.roles || ["ROLE_USER"],
          };
        }
      } catch (decodeErr) {
      }
      throw new Error("Failed to fetch user profile");
    }
  };

  const login = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      const response = await api.post<LoginResponse>(
        "/login_check",
        credentials,
      );
      const { token: authToken, refresh_token: refreshAuthToken } =
        response.data;

      setTokens(authToken, refreshAuthToken);

      const userProfile = await fetchUserProfile();
      user.value = userProfile;
    } catch (err: any) {
      clearTokens();
      const message = err.response?.data?.message || err.message ||
        "Login failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      clearError();
      clearTokens();
    } catch (err: any) {
    }
  };

  const refreshAuthToken = async (): Promise<void> => {
    try {
      if (!refreshToken.value) {
        throw new Error("No refresh token available");
      }

      const response = await api.post<LoginResponse>("/token/refresh", {
        refresh_token: refreshToken.value,
      });

      const { token: newToken, refresh_token: newRefreshToken } = response.data;
      setTokens(newToken, newRefreshToken);
    } catch (err: any) {
      clearTokens();
    }
  };

  const initializeAuth = async (): Promise<void> => {
    if (isInitialized.value) {
      return;
    }

    try {
      const storedToken = localStorage.getItem("auth_token");
      const storedRefreshToken = localStorage.getItem("refresh_token");

      if (storedToken && storedRefreshToken) {
        token.value = storedToken;
        refreshToken.value = storedRefreshToken;

        api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;

        try {
          const userProfile = await fetchUserProfile();
          user.value = userProfile;
        } catch (err) {
          clearTokens();
        }
      }
    } catch (err) {
      clearTokens();
    } finally {
      isInitialized.value = true;
    }
  };

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          await refreshAuthToken();
          originalRequest.headers["Authorization"] = `Bearer ${token.value}`;
          return api(originalRequest);
        } catch (refreshError) {
          clearTokens();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    },
  );

  return {
    user,
    token,
    refreshToken,
    isLoading,
    error,
    isInitialized,

    isAuthenticated,
    userRoles,

    login,
    logout,
    refreshAuthToken,
    initializeAuth,
    setError,
    clearError,
  };
});
