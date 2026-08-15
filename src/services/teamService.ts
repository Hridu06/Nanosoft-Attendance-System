import { apiRequest } from "./api";
import type { Team, TeamFormInput } from "../types/team";

interface TeamListResponse {
  teams: Team[];
}

interface TeamResponse {
  message: string;
  team: Team;
}

export const getTeamList = async (): Promise<Team[]> => {
  const data = await apiRequest<TeamListResponse>("/teams");
  return data.teams;
};

export const createTeam = async (input: TeamFormInput): Promise<Team> => {
  const data = await apiRequest<TeamResponse>("/teams", {
    method: "POST",
    body: input,
  });

  return data.team;
};

export const updateTeam = async (
  id: number,
  input: TeamFormInput,
): Promise<Team> => {
  const data = await apiRequest<TeamResponse>(`/teams/${id}`, {
    method: "PUT",
    body: input,
  });

  return data.team;
};

export const deleteTeam = (id: number): Promise<void> =>
  apiRequest(`/teams/${id}`, { method: "DELETE" });
