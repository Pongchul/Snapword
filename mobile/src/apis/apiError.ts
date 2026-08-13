class ApiError extends Error {
    status: number;
    rawBody?: unknown;

    constructor(status: number, message: string, rawBody?: unknown) {
        super(message);

        this.status = status;
        this.rawBody = rawBody;
        this.name = 'ApiError';
    }
}

export default ApiError;
