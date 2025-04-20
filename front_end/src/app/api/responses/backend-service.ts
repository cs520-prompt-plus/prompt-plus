import backendAgent from '../http-client';
import { AxiosResponse } from 'axios';
import {
    ResponseCreatePayload,
    ResponseCreateResponse,
    ResponseComponentCreatePayload,
    ResponseComponentCreateResponse,
} from '@/types/response';

export const createResponseEndpoint = () => `/responses/`;
export const createResponseComponentEndpoint = () => `/response-components/`;

export const createResponse = async (payload: ResponseCreatePayload): Promise<AxiosResponse<ResponseCreateResponse>> => {
  return await backendAgent.post<ResponseCreateResponse>(createResponseEndpoint(),payload);;
};

export const createResponseComponent = async (payload: ResponseComponentCreatePayload): Promise<AxiosResponse<ResponseComponentCreateResponse>> => {
    return await backendAgent.post<ResponseComponentCreateResponse>(createResponseComponentEndpoint(),payload);;
  };
