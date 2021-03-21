import * as C from './consts';
import * as T from './types';

export interface Route<Get, PostReq, PostRes, DelReq, DelRes> {
    path: string;
    _phantom_Get?: Get;
    _phantom_PostReq?: PostReq;
    _phantom_PostRes?: PostRes;
    _phantom_DelReq?: DelReq;
    _phantom_DelRes?: DelRes;
}

export type GetRoute<T> = Route<T, never, never, never, never>;

export class Routes {
    static tables(id: string): GetRoute<T.TableDetail>;

    static tables(
        search: T.TableSearchOptions
    ): GetRoute<{ tables: [T.TableSummary] }>;

    static tables(searchOrId: string | T.TableSearchOptions): GetRoute<any> {
        if (typeof searchOrId === 'string') {
            return { path: `${C.API_ROOT}/tables/${searchOrId}` };
        } else {
            return { path: `${C.API_ROOT}/tables` };
        }
    }
}
