export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/** Único ponto do front que faz chamadas HTTP. Usado pelos repositórios. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    const isForm = init?.body instanceof FormData;
    res = await fetch(`/api${path}`, {
      ...init,
      // FormData define o próprio Content-Type (multipart com boundary).
      headers: isForm ? init?.headers : { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(0, 'Não foi possível falar com o backend. Ele está rodando?');
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? body.title ?? detail;
    } catch {
      /* corpo vazio ou não-JSON */
    }
    if (res.status >= 502 && res.status <= 504) {
      detail = 'Backend indisponível. Ele está rodando?';
    }
    throw new ApiError(res.status, detail);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));
