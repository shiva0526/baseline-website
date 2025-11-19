import axiosClient from "./axiosClient";

export interface Tournament {
  id: number;
  title: string;
  date: string;
  location: string;
  description?: string;
  matchType: string;
  ageGroups: string[];
  registrationOpen: string;
  registrationClose: string;
  status: string;
  createdAt: string;
}




// --- API calls ---
export const getTournaments = async (): Promise<Tournament[]> => {
  const res = await axiosClient.get("/tournaments/");
  return res.data;
};

export const createTournament = async (
  data: Omit<Tournament, "id" | "status" | "createdAt">
) => {
  const res = await axiosClient.post("/tournaments/", {
    ...data,
    match_type: data.matchType,
    age_groups: data.ageGroups,
    registration_open: data.registrationOpen,
    registration_close: data.registrationClose
  });
  return res.data;
};

export const getTournament = async (id: number): Promise<Tournament> => {
  const res = await axiosClient.get(`/tournaments/${id}`);
  return res.data;
};

// Cancel tournament (updates status to cancelled)
export const deleteTournament = async (id: number) => {
  const res = await axiosClient.put(`/tournaments/${id}/cancel`);
  return res.data;
};
