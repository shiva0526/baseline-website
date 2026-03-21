import axiosClient from "./axiosClient";

export const getPlayers = async () => {
  const res = await axiosClient.get("/players/");
  return res.data;
};


export const addPlayer = async (player: { name: string; program: "2-Day" | "4-Day"; batch?: string }) => {
  const res = await axiosClient.post("/players/", player);
  return res.data;
};


export const removePlayer = async (id: number) => {
  await axiosClient.delete(`/players/${id}`);
};

export const updatePlayer = async (id: number, data: {
  name?: string;
  program?: string;
  batch?: string;
  phone?: string;
  gender?: string;
  age?: number | null;
  avatar?: string;
  joining_date?: string;
}) => {
  const res = await axiosClient.put(`/players/${id}`, data);
  return res.data;
};

export const uploadAvatar = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await axiosClient.post(`/players/${id}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const savePerformanceRatings = async (id: number, ratings: Record<string, number>) => {
  const res = await axiosClient.put(`/players/${id}/performance`, { ratings });
  return res.data;
};
