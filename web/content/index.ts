/// <reference path="_imports.d.ts" />

import {
    elementOpen,
    elementClose,
    text,
    patch as patchIncrementalDom,
} from 'incremental-dom';

import { TableDetail } from '../api-v1/types';
import createClient from '../api-v1/client';

import './index.css';

const { GET, POST, DELETE } = createClient(window.fetch);

type Action =
    | {
          ty: 'startPlaying';
          manifold: { ty: string; name: string; size: string };
      }
    | { ty: 'backToStart' };
type State =
    | { at: 'start' }
    | { at: 'playing'; manifold: { ty: string; name: string; size: string } };
type Dispatch = (action: Action) => void;

function initialState(): State {
    return { at: 'playing', manifold: { ty: 'a', name: 'b', size: '9x9' } };
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

enum TileType {
    empty,
    black,
    white,
}

const tileOf = (type: TileType, r: number, c: number): RF => {
    switch (type) {
        case TileType.empty:
            return tile(
                r == 0 ? 0 : r == 8 ? 2 : 1,
                c == 0 ? 0 : c == 8 ? 2 : 1
            );
        case TileType.black:
            return tile(0, 3);
        case TileType.white:
            return tile(1, 3);
    }
};

const boardInit = `
. . . . . . . . .
. . . . . . . . .
. . . . . . . . .
. . W B . . . . .
. . B W . B . . .
. . B W W B . . .
. . . . B . . . .
. . . . . . . . .
. . . . . . . . .
`;

const boardData: TileType[][] = (() => {
    const res: TileType[][] = [];
    const chars = boardInit
        .split(/[\n ]+/)
        .map((s) => s.trim())
        .filter(Boolean);
    console.log(chars.length);
    console.log(chars.join(''));
    for (let r = 0; r < 9; r++) {
        res.push([]);
        for (let c = 0; c < 9; c++) {
            switch (chars.shift()) {
                case '.':
                    res[r].push(TileType.empty);
                    break;
                case 'B':
                    res[r].push(TileType.black);
                    break;
                case 'W':
                    res[r].push(TileType.white);
                    break;
            }
        }
    }
    console.log(res);
    return res;
})();

const board = (): RF => {
    const idxs = Array.from(new Array(9).keys());
    return E('table', { class: 'game-grid' })(
        ...idxs.map((r) =>
            $tr(...idxs.map((c) => $td(tileOf(boardData[r][c], r, c))))
        )
    );
};

const render = (state: State, dispatch: Dispatch): RF => {
    switch (state.at) {
        case 'start':
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
                        manifold: { ty: manifold, name, size },
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

        case 'playing':
            return $_(
                board(),
                button((e) => dispatch({ ty: 'backToStart' }))(
                    T('Back to start')
                )
            );
    }
};

(window as any).startGame = (init: TableDetail, root: Element): void => {
    const canvas = document.createElement('canvas');
    const page = document.createElement('div');

    canvas.setAttribute('width', '400');
    canvas.setAttribute('height', '400');

    root.appendChild(canvas);
    root.appendChild(page);

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
        patchIncrementalDom(page, render(s.state, dispatch));
    }

    update();
};
