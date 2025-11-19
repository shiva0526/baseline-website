import axiosClient from "./axiosClient";

export interface Registration {
  id: number;
  tournament_id: number;
  team_name: string;
  captain_name: string;
  phone: string;
  email: string;
  player_names: string[];
  created_at: string;
}

// --- API calls ---
export const registerTeam = async (tournamentId: number, data: Omit<Registration, "id" | "created_at" | "tournament_id">) => {
  const res = await axiosClient.post(`/registrations/${tournamentId}`, data);
  return res.data;
};

export const getRegistrations = async (tournamentId: number): Promise<Registration[]> => {
  const res = await axiosClient.get(`/registrations/${tournamentId}`);
  return res.data;
};
