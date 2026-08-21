import { apiRequest } from "./api";
import type { Designation, DesignationFormInput } from "../types/designation";

interface DesignationListResponse {
  designations: Designation[];
}

interface DesignationResponse {
  message: string;
  designation: Designation;
}

let designationListCache: Promise<Designation[]> | null = null;

export const getDesignationList = (): Promise<Designation[]> => {
  if (!designationListCache) {
    designationListCache = apiRequest<DesignationListResponse>("/designations")
      .then((data) => data.designations)
      .catch((error) => {
        designationListCache = null;
        throw error;
      });
  }

  return designationListCache;
};

export const createDesignation = async (
  input: DesignationFormInput,
): Promise<Designation> => {
  const data = await apiRequest<DesignationResponse>("/designations", {
    method: "POST",
    body: input,
  });

  designationListCache = null;
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

  designationListCache = null;
  return data.designation;
};

export const deleteDesignation = async (id: number): Promise<void> => {
  await apiRequest(`/designations/${id}`, { method: "DELETE" });
  designationListCache = null;
};
