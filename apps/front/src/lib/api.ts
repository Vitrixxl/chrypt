import { Result, tryCatch } from '@shrymp/utils';

type ApiError = {
  message: string;
  details: Record<string, any> | null;
};
export class Api {
  constructor(private basePath: string) {
  }
  private toApiPath(path: string) {
    if (path.startsWith('/')) return '/api' + path;
    return '/api/' + path;
  }
  private handleResponseError(res: Response): { data: null; error: ApiError } {
    if (res.status == 404) {
      return { data: null, error: { message: 'Not found', details: res } };
    }
    return {
      data: null,
      error: { message: 'Error while fetching data', details: res },
    };
  }
  private async handleResponse<T>(
    { data: responseData, error: responseError }: Result<Response>,
  ): Promise<Result<T, ApiError>> {
    if (responseError) {
      console.error(responseError);
      return {
        data: null,
        error: { message: responseError.message, details: responseError },
      };
    }
    if (!responseData.ok) {
      return this.handleResponseError(responseData);
    }

    const { data, error } = await tryCatch<Result<T, ApiError>>(
      responseData.json(),
    );
    if (error) {
      return {
        data: null,
        error: { message: 'Error while decoding the response', details: error },
      };
    }

    if (data.error) {
      return { data: null, error: data.error };
    }

    return data;
  }

  async get<T>(
    path: string,
    opts?: Omit<RequestInit, 'body' | 'method'> & {
      body?: Record<string, any>;
    },
  ): Promise<Result<T, ApiError>> {
    const response = await tryCatch<
      Response
    >(
      fetch(new URL(this.toApiPath(path), this.basePath), {
        ...opts,
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...opts?.headers,
        },
        body: opts?.body ? JSON.stringify(opts.body) : undefined,
      }),
    );
    return this.handleResponse(response);
  }

  async post<T>(
    path: string,
    opts?: Omit<RequestInit, 'body' | 'method'> & {
      body?: Record<string, any>;
    },
  ): Promise<Result<T, ApiError>> {
    const response = await tryCatch<Response>(
      fetch(new URL(this.toApiPath(path), this.basePath), {
        ...opts,
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...opts?.headers,
        },
        body: opts?.body ? JSON.stringify(opts.body) : undefined,
      }),
    );
    return this.handleResponse(response);
  }

  async put<T>(
    path: string,
    opts?: Omit<RequestInit, 'body' | 'method'> & {
      body?: Record<string, any>;
    },
  ): Promise<Result<T, ApiError>> {
    const response = await tryCatch<Response>(
      fetch(new URL(this.toApiPath(path), this.basePath), {
        ...opts,
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...opts?.headers,
        },
        body: opts?.body ? JSON.stringify(opts.body) : undefined,
      }),
    );
    return this.handleResponse(response);
  }

  async patch<T>(
    path: string,
    opts?: Omit<RequestInit, 'body' | 'method'> & {
      body?: Record<string, any>;
    },
  ): Promise<Result<T, ApiError>> {
    const response = await tryCatch<Response>(
      fetch(new URL(this.toApiPath(path), this.basePath), {
        ...opts,
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...opts?.headers,
        },
        body: opts?.body ? JSON.stringify(opts.body) : undefined,
      }),
    );
    return this.handleResponse(response);
  }

  async delete<T>(
    path: string,
    opts?: Omit<RequestInit, 'body' | 'method'> & {
      body?: Record<string, any>;
    },
  ): Promise<Result<T, ApiError>> {
    const response = await tryCatch<Response>(
      fetch(new URL(this.toApiPath(path), this.basePath), {
        ...opts,
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...opts?.headers,
        },
        body: opts?.body ? JSON.stringify(opts.body) : undefined,
      }),
    );
    return this.handleResponse(response);
  }
}

export const api = new Api(import.meta.env.VITE_BASE_API_URL!);
