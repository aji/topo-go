import { TableDetail } from '../api-v1/types';
import { Routes } from '../api-v1/routes';
import createClient from '../api-v1/client';

import {
    elementOpen,
    elementClose,
    elementVoid,
    text,
    patch as patchIncrementalDom,
} from 'incremental-dom';

const { GET, POST, DELETE } = createClient(window.fetch);

type Action =
    | { ty: 'startPlaying'; manifold: { ty: string; name: string } }
    | { ty: 'backToStart' };
type State =
    | { at: 'start' }
    | { at: 'playing'; manifold: { ty: string; name: string } };
type Dispatch = (action: Action) => void;

function initialState(): State {
    return { at: 'start' };
}

function reduce(state: State, action: Action): State {
    switch (action.ty) {
        case 'startPlaying':
            return { at: 'playing', manifold: action.manifold };
        case 'backToStart':
            return { at: 'start' };
        default:
            console.log('unknown action type');
            return state;
    }
}

type RF = () => void;

const T = (s: string): RF => () => text(s);
const E = (s: string, ...args: any[]) => (...children: RF[]): RF => () => (
    elementOpen(s, ...args), children.forEach((f) => f()), elementClose(s)
);

const $_ = E('div');
const $b = E('b');
const $tr = E('tr');
const $td = E('td');

const tabularize = E('table', null, null, 'class', 'tabularize');
const button = (hdlr: (e: Event) => void) =>
    E('button', null, null, 'onclick', hdlr, 'class', 'cls');

const row = (...children: RF[]) => $tr(...children.map((c) => $td(c)));

const renderAt = {
    start: (state: State, dispatch: Dispatch): RF => {
        const manifolds = [
            ['normal', 'Normal'],
            ['cylinder', 'Cylinder'],
            ['mobius', 'Mobius strip'],
            ['torus', 'Torus'],
            ['klein', 'Klein bottle'],
            ['projective', 'Projective plane'],
        ];
        const sizes = ['9x9', '13x13', '19x19'];

        const choiceHandler = (
            manifold: string,
            name: string,
            size: string
        ) => (e: Event) => {
            if (confirm(`Start ${size} ${manifold} game?`)) {
                dispatch({
                    ty: 'startPlaying',
                    manifold: { ty: manifold, name },
                });
            }
        };

        const choicesRow = (manifold: string, name: string): RF => {
            return row(
                $b(T(name)),
                ...sizes.map((size) =>
                    button(choiceHandler(manifold, name, size))(T(size))
                )
            );
        };

        return $_(
            T('Start a game at this table:'),
            tabularize(...manifolds.map(([m, n]) => choicesRow(m, n)))
        );
    },

    playing: (state: State, dispatch: Dispatch): RF =>
        $_(
            $b(T('Game in progress...')),
            button((e) => dispatch({ ty: 'backToStart' }))(T('Back to start'))
        ),
};

const render = (state: State, dispatch: Dispatch): RF =>
    renderAt[state.at](state, dispatch);

(window as any).startGame = (init: TableDetail, game: Element): void => {
    const s = { state: initialState(), pending: false };
    function update() {
        s.pending = false;
        function dispatch(action: Action) {
            s.state = reduce(s.state, action);
            if (!s.pending) {
                s.pending = true;
                setTimeout(update, 0);
            }
        }
        patchIncrementalDom(game, render(s.state, dispatch));
    }
    update();
};
