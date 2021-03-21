import { Route } from './routes';
import { ErrorBody } from './types';

type Fetch = typeof window.fetch;

export type Result<T> = { ok: true; body: T } | { ok: false; body: ErrorBody };

export interface Client {
    GET<T>(
        r: Route<T, any, any, any, any>,
        init?: RequestInit
    ): Promise<Result<T>>;

    POST<Req, Res>(
        r: Route<any, Req, Res, any, any>,
        body: Req,
        init?: RequestInit
    ): Promise<Result<Res>>;

    DELETE<Req, Res>(
        r: Route<any, any, any, Req, Res>,
        body?: Req,
        init?: RequestInit
    ): Promise<Result<Res>>;
}

export default function (fetch: Fetch): Client {
    function GET<T>(
        r: Route<T, any, any, any, any>,
        init: RequestInit = {}
    ): Promise<Result<T>> {
        return fetch(
            r.path,
            Object.assign({}, init, {
                method: 'GET',
                headers: { Accept: 'application/json' },
            })
        ).then((res) => res.json().then((body) => ({ ok: res.ok, body })));
    }

    function POST<Req, Res>(
        r: Route<any, Req, Res, any, any>,
        body: Req,
        init: RequestInit = {}
    ): Promise<Result<Res>> {
        return fetch(
            r.path,
            Object.assign({}, init, {
                method: 'POST',
                headers: Object.assign(
                    { Accept: 'application/json' },
                    body ? { 'Content-Type': 'application/json' } : {}
                ),
                body: JSON.stringify(body),
            })
        ).then((res) => res.json().then((body) => ({ ok: res.ok, body })));
    }

    function DELETE<Req, Res>(
        r: Route<any, any, any, Req, Res>,
        body?: Req,
        init: RequestInit = {}
    ): Promise<Result<Res>> {
        return fetch(
            r.path,
            Object.assign({}, init, {
                method: 'DELETE',
                headers: Object.assign(
                    { Accept: 'application/json' },
                    body ? { 'Content-Type': 'application/json' } : {}
                ),
                body: JSON.stringify(body),
            })
        ).then((res) => res.json().then((body) => ({ ok: res.ok, body })));
    }

    return { GET, POST, DELETE };
}
