import axiosClient from "./axiosClient";

export type AttendanceMap = Record<number, boolean>; 
// e.g. { 1: true, 2: false }

export const getAttendance = async (date: string): Promise<AttendanceMap> => {
  try {
    const res = await axiosClient.get(`/attendance/${date}`);
    // Convert string keys to numbers if needed
    const data = res.data;
    const result: AttendanceMap = {};
    Object.keys(data).forEach(key => {
      result[Number(key)] = data[key];
    });
    return result;
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return {};
  }
};

export const updateAttendance = async (date: string, attendance: AttendanceMap) => {
  const res = await axiosClient.put(`/attendance/${date}`, { attendance });
  return res.data; // { status: "ok", date: "...", updated: N }
};
