export type TeamMemberRole = "team_leader" | "manager" | "employee";

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: TeamMemberRole;
}

export interface Team {
  id: number;
  name: string;
  member_count: number;
  members: TeamMember[];
  created_at: string;
  updated_at: string;
}

export interface TeamMemberInput {
  user_id: number;
  role: TeamMemberRole;
}

export interface TeamFormInput {
  name: string;
  members: TeamMemberInput[];
}
