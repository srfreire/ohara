import api_client from "./client";
import type { User } from "../types/api";

export const login_with_google = (): void => {
  window.location.href = `${api_client.defaults.baseURL}/auth/login`;
};

export const handle_auth_callback = async (): Promise<User | null> => {
  try {
    const url_params = new URLSearchParams(window.location.search);

    const id = url_params.get("id") || url_params.get("user_id");
    const email = url_params.get("email");

    if (id && email) {
      const user_data: User = {
        id,
        email,
        name: url_params.get("name") || "",
        avatar_url: url_params.get("avatar_url") || undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      localStorage.setItem("user", JSON.stringify(user_data));
      return user_data;
    }

    const stored_user = localStorage.getItem("user");
    if (stored_user) {
      return JSON.parse(stored_user) as User;
    }

    return null;
  } catch (error) {
    console.error("Auth callback error:", error);
    throw error;
  }
};

export const get_current_user = (): User | null => {
  try {
    const user = localStorage.getItem("user");
    return user ? (JSON.parse(user) as User) : null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
};

export const refresh_token = async (): Promise<void> => {
  try {
    await api_client.get("/auth/refresh");
  } catch (error) {
    console.error("Token refresh error:", error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await api_client.get("/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("user");
    window.location.href = "/";
  }
};

export const logout_all = async (): Promise<void> => {
  try {
    await api_client.get("/auth/logout-all");
  } catch (error) {
    console.error("Logout all error:", error);
  } finally {
    localStorage.removeItem("user");
    window.location.href = "/";
  }
};

export const is_authenticated = (): boolean => {
  const user = localStorage.getItem("user");
  return !!user;
};
