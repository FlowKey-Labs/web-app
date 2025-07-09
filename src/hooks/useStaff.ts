import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/axios";

const fetchStaff = async () => {
  const { data } = await api.get("/api/staff/staff");
  return data;
};

export const useStaff = () => {
  return useQuery({
    queryKey: ["staff"],
    queryFn: fetchStaff,
  });
};
