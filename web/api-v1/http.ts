import * as S from './state';

export const API_ROOT = '/api/v1';

//
//
//
// TYPES -------------------------------------------------------------
//

export type ErrorBody = { message?: string };

export type Result<T> = { ok: true; body: T } | { ok: false; body: ErrorBody };

export type SearchToken = string;

export type SearchOptions = { limit?: number } | { cont?: SearchToken };

export interface Search<T> {
    results: T[];
    next?: SearchToken;
    prev?: SearchToken;
}

export interface Table {
    id: string;
    name: string;
    seqno?: number;
    state?: S.TableEncoded;
}

export interface Transitions {
    seqno: number;
    trs: S.TableTransitionEncoded[][];
}

//
//
//
// RESOURCE TREE -----------------------------------------------------
//

export interface ApiRequest<T> {
    req: Request;
    _phantom_T?: T;
}

const GET = <T>(p: string): ApiRequest<T> => ({
    req: new Request(`${API_ROOT}/${p}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
    }),
});

const POST = <S, T>(p: string, body: S): ApiRequest<T> => ({
    req: new Request(`${API_ROOT}/${p}`, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    }),
});

export const API = {
    tables: {
        get: () => GET<Table[]>('tables'),
    },

    table: (id: string) => ({
        get: () => GET<Table>(`tables/${id}`),

        post: (b: S.TableActionEncoded) =>
            POST<S.TableActionEncoded, {}>(`tables/${id}`, b),

        transitions: {
            get: (opts: { since?: number }) =>
                GET<Transitions>(
                    `tables/${id}/transitions?since=${opts.since || 0}`
                ),
        },
    }),
};

type Fetch = typeof window.fetch;

export type ApiCaller = <T>(req: ApiRequest<T>) => Promise<Result<T>>;

export function createClient(fetch: Fetch): ApiCaller {
    return <T>(r: ApiRequest<T>) =>
        fetch(r.req.url, r.req).then((res) =>
            res.json().then((body) => ({ ok: res.ok, body }))
        );
}
