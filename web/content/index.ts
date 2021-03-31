/// <reference path="_imports.d.ts" />

import {
    elementOpen,
    elementClose,
    text,
    patch as patchIncrementalDom,
} from 'incremental-dom';

import * as S from '../api-v1/state';
import * as http from '../api-v1/http';
import { API, createClient } from '../api-v1/http';
import * as C from '../api-v1/client';

import './index.css';

type Action =
    | { ty: 'stateStart'; e: C.ConnStartEvent }
    | { ty: 'stateChange'; e: C.ConnChangeEvent }
    | { ty: 'actionStart'; a: S.TableAction }
    | { ty: 'actionError' };

type State = {
    call: http.ApiCaller;
    tableInit: http.Table;
    seqno?: number;
    table?: S.Table;
    lastTableAction?: S.TableAction;
    speculative?: S.Table;
};

type Dispatch = (action: Action) => void;

function initialState(call: http.ApiCaller, init: http.Table): State {
    return {
        call,
        tableInit: init,
        seqno: init.seqno,
        table: init.state && S.tableCodec.decode(init.state),
    };
}

function reduce(state: State, action: Action): State {
    switch (action.ty) {
        case 'stateStart':
            return { call: state.call, tableInit: state.tableInit };
        case 'stateChange':
            return {
                ...state,
                seqno: action.e.seqno,
                table: action.e.table,
                speculative: undefined,
            };
        case 'actionStart':
            let spec = undefined;
            if (state.table) {
                spec = state.table;
                for (const t of S.tableActionToBatch(spec, action.a)) {
                    spec = S.tableApply(spec, t);
                }
            }
            return {
                ...state,
                lastTableAction: action.a,
                speculative: spec,
            };
        case 'actionError':
            return { ...state, speculative: undefined };
        default:
            console.log('unknown action type');
            return state;
    }
}

function tableAction(state: State, dispatch: Dispatch, a: S.TableAction) {
    if (state.speculative !== undefined) {
        return;
    }
    dispatch({ ty: 'actionStart', a });
    const req = API.table(state.tableInit.id).post(
        S.tableActionCodec.encode(a)
    );
    state.call(req).then(
        (res) => {
            if (!res.ok) {
                dispatch({ ty: 'actionError' });
            }
        },
        (err) => {
            console.log(err);
            dispatch({ ty: 'actionError' });
        }
    );
}

type RF = () => void;

const flatten = (obj: { [key: string]: any }): any[] =>
    ([] as any[]).concat.apply([], Object.entries(obj));

const T = (s: string): RF => () => text(s);
const E = (s: string, opts: { [key: string]: any } = {}) => (
    ...children: RF[]
): RF => () => (
    elementOpen(s, null, null, ...flatten(opts)),
    children.forEach((f) => f()),
    elementClose(s)
);

const $_ = E('div');
const $b = E('b');
const $p = E('p');
const $tr = E('tr');
const $td = E('td');

const tabularize = E('table', { class: 'tabularize' });
const button = (hdlr: (e: Event) => void) => E('button', { onclick: hdlr });

const row = (...children: RF[]) => $tr(...children.map((c) => $td(c)));

const tile = (r: number, c: number): RF => {
    return E('div', {
        class: 'game-tile',
        style: `background-position: -${c * 40}px -${r * 40}px`,
    })();
};

const render = (state: State, dispatch: Dispatch): RF => {
    const table = state.table;

    if (table === undefined) {
        return $p(T('Loading...'));
    }

    const manifolds: [S.ManifoldType, string][] = [
        ['normal', 'Normal'],
        ['cylinder', 'Cylinder'],
        ['mobius', 'Mobius strip'],
        ['torus', 'Torus'],
        ['klein', 'Klein bottle'],
        ['projective', 'Projective plane'],
    ];
    const sizes: S.ManifoldSize[] = ['9x9', '13x13', '19x19'];

    const choiceHandler = (manifold: S.Manifold, name: string) => (
        e: Event
    ) => {
        if (confirm(`Start ${name} game?`)) {
            tableAction(state, dispatch, {
                t: 'reset',
                v: { manifold },
            });
        }
    };

    const choicesRow = (manifold: S.ManifoldType, name: string): RF => {
        return row(
            $b(T(name)),
            ...sizes.map((size) => {
                const m = S.Manifold.of(manifold, size);
                return button(choiceHandler(m, name))(T(size));
            })
        );
    };

    return $_(
        T('Start a game at this table:'),
        tabularize(...manifolds.map(([m, n]) => choicesRow(m, n)))
    );
};

(window as any).startGame = (init: http.Table, root: Element): void => {
    const canvas = document.createElement('canvas');
    const page = document.createElement('div');

    canvas.setAttribute('width', '400');
    canvas.setAttribute('height', '400');

    root.appendChild(canvas);
    root.appendChild(page);

    const apiClient = createClient(window.fetch);
    const s = { state: initialState(apiClient, init), pending: false };

    function update() {
        s.pending = false;
        patchIncrementalDom(page, render(s.state, dispatch));
    }

    function dispatch(action: Action) {
        s.state = reduce(s.state, action);
        if (!s.pending) {
            s.pending = true;
            setTimeout(update, 0);
        }
    }

    update();

    const conn = C.Connection.resume(apiClient, init, {
        start: (e) => dispatch({ ty: 'stateStart', e }),
        change: (e) => dispatch({ ty: 'stateChange', e }),
    });
};
