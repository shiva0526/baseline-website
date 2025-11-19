import axiosClient from "./axiosClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export const login = async (data: LoginRequest) => {
  // Backend expects OAuth2PasswordRequestForm fields: username, password (form-encoded)
  const formData = new FormData();
  formData.append("username", data.email); // OAuth2 expects 'username' field
  formData.append("password", data.password);
  formData.append("grant_type", "password"); // Required by OAuth2 spec
  
  const res = await axiosClient.post("/auth/login", formData, {
    headers: { 
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const logout = async () => {
  await axiosClient.post("/auth/logout");
};

export const refreshToken = async () => {
  const res = await axiosClient.post("/auth/refresh");
  return res.data;
};
