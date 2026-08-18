import { apiRequest } from "./api";
import type { Designation, DesignationFormInput } from "../types/designation";

interface DesignationListResponse {
  designations: Designation[];
}

interface DesignationResponse {
  message: string;
  designation: Designation;
}

export const getDesignationList = async (): Promise<Designation[]> => {
  const data = await apiRequest<DesignationListResponse>("/designations");
  return data.designations;
};

export const createDesignation = async (
  input: DesignationFormInput,
): Promise<Designation> => {
  const data = await apiRequest<DesignationResponse>("/designations", {
    method: "POST",
    body: input,
  });

  return data.designation;
};

export const updateDesignation = async (
  id: number,
  input: DesignationFormInput,
): Promise<Designation> => {
  const data = await apiRequest<DesignationResponse>(`/designations/${id}`, {
    method: "PUT",
    body: input,
  });

  return data.designation;
};

export const deleteDesignation = (id: number): Promise<void> =>
  apiRequest(`/designations/${id}`, { method: "DELETE" });
