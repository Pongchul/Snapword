import ApiError from './apiError';
import { DEFAULT_ERROR_MESSAGES } from './constants/defaultErrorMessage';
import { ENV } from './env';
import { tokenStorage } from '../utils/secureStorage';

type JsonBody = Record<string, unknown>;

type FetcherOptions<TRequest extends JsonBody> = {
    path: string;
    query?: Record<string, string | number | undefined>;
    body?: TRequest;
    headers?: Record<string, string>;
};

export const fetcher = {
    get: async <TResponse>({ path, query }: FetcherOptions<never>) =>
        request<never, TResponse>({ path, query, method: 'GET' }),
    post: async <TRequest extends JsonBody, TResponse>({ path, body, headers }: FetcherOptions<TRequest>) =>
        request<TRequest, TResponse>({ path, body, method: 'POST', headers }),
    delete: async <TResponse>({ path }: FetcherOptions<never>) =>
        request<never, TResponse>({ path, method: 'DELETE' }),
};

type FetchMethod = 'GET' | 'POST' | 'DELETE';

type RequestOptions<TRequest> = {
    path: string;
    method: FetchMethod;
    query?: Record<string, string | number | undefined>;
    body?: TRequest;
    headers?: Record<string, string>;
};

const request = async <TRequest, TResponse>({
    path,
    method,
    query = {},
    body,
    headers,
}: RequestOptions<TRequest>): Promise<TResponse | null> => {
    try {
        const url = new URL(ENV.baseUrl + path);
        const stringifiedQuery: Record<string, string> = Object.fromEntries(
            Object.entries(query)
                .map(([key, value]) => [key, value?.toString()])
                .filter((entry): entry is [string, string] => Boolean(entry[1])),
        );
        url.search = new URLSearchParams(stringifiedQuery).toString();

        const token = await tokenStorage.load();

        const config: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...headers,
            },
        };

        if (body && method === 'POST') {
            config.body = JSON.stringify(body);
        }

        const response = await fetch(url.toString(), config);

        if (!response.ok) {
            const status = response.status;
            const contentType = response.headers.get('Content-Type');
            let rawBody;
            let errorMessage = DEFAULT_ERROR_MESSAGES[status];

            try {
                if (contentType?.includes('application/json')) {
                    rawBody = await response.json();
                    errorMessage = rawBody?.message ?? errorMessage;
                } else {
                    rawBody = await response.text();
                    errorMessage = rawBody || errorMessage;
                }
            } catch {
                errorMessage = '응답 파싱에 실패했습니다.';
            }

            throw new ApiError(status, errorMessage ?? '', rawBody);
        }

        const contentType = response.headers.get('Content-Type');
        if (contentType?.includes('application/json')) {
            try {
                return await response.json();
            } catch {
                return null;
            }
        }

        return null;
    } catch (error) {
        console.error(error);
        throw error;
    }
};
