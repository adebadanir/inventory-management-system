export interface User {
  id?: number;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user";
  password: string;
  refresh_token: string;
  confPassword: string;
  newPassword?: string;
  confNewPassword?: string;
}
