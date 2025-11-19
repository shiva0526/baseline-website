import axiosClient from "./axiosClient";

export interface Announcement {
  id: number;
  message: string;
  expires_at?: string;
  created_at: string;
}

export const getAnnouncements = async (): Promise<Announcement[]> => {
  const res = await axiosClient.get("/announcements/");
  return res.data;
};

export const createAnnouncement = async (message: string, expires_at?: string): Promise<Announcement> => {
  const res = await axiosClient.post("/announcements/", { message, expires_at });
  return res.data;
};

export const deleteAnnouncement = async (id: number): Promise<void> => {
  await axiosClient.delete(`/announcements/${id}`);
};
