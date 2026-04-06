import axiosInstance from "./axiosInstance";

interface LoginPayload {
  username: string;
  password: string;
}

interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  id: number;
  username: string;
  meta: {
    email: string;
    fullname: string;
    phone: string;
    role: string;
  };
  is_active: boolean;
}

export const authService = {
  login: (payload: LoginPayload) =>
    axiosInstance.post<AuthResponse>("/accounts/login", payload),

  signup: (payload: SignupPayload) =>
    axiosInstance.post<AuthResponse>("/auth/register", payload),

  logout: () =>
    axiosInstance.post("/auth/logout"),
};
