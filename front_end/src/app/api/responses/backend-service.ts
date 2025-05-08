import axios from "axios";
import { AxiosResponse } from "axios";
import {
  ResponseCreatePayload,
  ResponseCreateResponse,
  ResponseUpdatePayload,
  MergePreviewsPayload,
  CategoryRead,
  CategoryPatternUpdatePayload,
} from "@/types/response";

const baseURL = "/api/proxy/api/v1";

export const getResponsesEndpoint = () => `${baseURL}/responses/`;
export const getResponseByIdEndpoint = (responseId: string) =>
  `${baseURL}/responses/${responseId}`;
export const createResponseEndpoint = () => `${baseURL}/responses/`;
export const updateResponseEndpoint = (responseId: string) =>
  `${baseURL}/responses/update/${responseId}`;
export const updatePatternEndpoint = (categoryId: string) =>
  `${baseURL}/categories/${categoryId}/patterns`;
export const mergePreviewsEndpoint = (responseId: string) =>
  `${baseURL}/responses/merge/${responseId}`;

export const getResponses = async (): Promise<
  AxiosResponse<ResponseCreateResponse[]>
> => {
  return await axios.get<ResponseCreateResponse[]>(getResponsesEndpoint());
};

export const getResponseById = async (
  responseId: string
): Promise<AxiosResponse<ResponseCreateResponse>> => {
  return await axios.get<ResponseCreateResponse>(
    getResponseByIdEndpoint(responseId)
  );
};

export const createResponse = async (
  payload: ResponseCreatePayload
): Promise<AxiosResponse<ResponseCreateResponse>> => {
  return await axios.post<ResponseCreateResponse>(
    createResponseEndpoint(),
    payload
  );
};

export const updateResponse = async (
  responseId: string,
  payload: ResponseUpdatePayload
): Promise<AxiosResponse<ResponseCreateResponse>> => {
  return await axios.put<ResponseCreateResponse>(
    updateResponseEndpoint(responseId),
    payload
  );
};

export const updateCategoryPatterns = async (
  categoryId: string,
  payload: CategoryPatternUpdatePayload
): Promise<AxiosResponse<CategoryRead>> => {
  return await axios.put<CategoryRead>(
    updatePatternEndpoint(categoryId),
    payload
  );
};

export const mergePreviews = async (
  responseId: string,
  payload: MergePreviewsPayload
): Promise<AxiosResponse<ResponseCreateResponse>> => {
  return await axios.put<ResponseCreateResponse>(
    mergePreviewsEndpoint(responseId),
    payload
  );
};
