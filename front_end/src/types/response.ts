export interface ResponseCreatePayload {
    user_id: string,
    input: string,
}

export interface ResponseCreateResponse {
    response_id: string,
    user_id : string,
    input: string,
    output: string,
    created_at: string,
}

export interface ResponseComponentCreatePayload {
    user_id: string,
    response_id: string,
    subject: string,
    input: string,
}

export interface ResponseComponentCreateResponse {
    component_id: string,
    response_id: string,
    user_id: string,
    subject: string,
    input: string,
    output: string,
}