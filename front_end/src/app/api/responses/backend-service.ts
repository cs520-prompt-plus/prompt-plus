import backendAgent from '../http-client';
import { AxiosResponse } from 'axios';
import {
    ResponseCreatePayload,
    ResponseCreateResponse,
    ResponseUpdatePayload,
    MergePreviewsPayload,
} from '@/types/response';

export const getResponseByIdEndpoint = (responseId: string) => `/responses/${responseId}`;
export const createResponseEndpoint = () => `/responses/`;
export const updateResponseEndpoint = (responseId : string) => `/responses/update/${responseId}`; 
export const mergePreviewsEndpoint = (responseId : string) => `/responses/merge/${responseId}`;

export const getResponseById = async (responseId: string): Promise<AxiosResponse<ResponseCreateResponse>> => {
  return await backendAgent.get<ResponseCreateResponse>(getResponseByIdEndpoint(responseId));
}

export const createResponse = async (payload: ResponseCreatePayload): Promise<AxiosResponse<ResponseCreateResponse>> => {
  return await backendAgent.post<ResponseCreateResponse>(createResponseEndpoint(),payload);
};

export const updateResponse = async (responseId: string, payload: ResponseUpdatePayload): Promise<AxiosResponse<ResponseCreateResponse>> => {
  return await backendAgent.put<ResponseCreateResponse>(updateResponseEndpoint(responseId),payload);
} 

export const mergePreviews = async (responseId: string, payload: MergePreviewsPayload): Promise<AxiosResponse<ResponseCreateResponse>> => {
  return await backendAgent.put<ResponseCreateResponse>(mergePreviewsEndpoint(responseId),payload);
} 