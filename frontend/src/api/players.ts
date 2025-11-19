import axiosClient from "./axiosClient";

export const getPlayers = async () => {
  const res = await axiosClient.get("/players/");
  return res.data;
};


export const addPlayer = async (player: { name: string; program: "3-Day" | "5-Day"; age?: number }) => {
  const res = await axiosClient.post("/players/", player);
  return res.data;
};


export const removePlayer = async (id: number) => {
  await axiosClient.delete(`/players/${id}`);
};
