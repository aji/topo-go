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

const T = (s: string): Node => document.createTextNode(s);
const E = (s: string) => (...children: Node[]): Element =>
    K(document.createElement(s), (e) =>
        children.forEach((c) => e.appendChild(c))
    );
const A = <T extends Element>(x: T, attrs: object): T =>
    K(x, (e) =>
        Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v))
    );
const K = <T>(x: T, f: (x: T) => void): T => (f(x), x);

const $_ = E('div');
const $p = E('p');
const $table = E('table');
const $b = E('b');
const $link = (href: string, ...xs: Node[]) => A(E('a')(...xs), { href });

const $a = (onClick: (e: Event) => void, ...xs: Node[]) =>
    K(E('a')(...xs), (e) => e.addEventListener('click', onClick));
const $button = (onClick: (e: Event) => void, ...xs: Node[]) =>
    K(E('button')(...xs), (e) => e.addEventListener('click', onClick));

const $tabularize = (...xs: Node[]): Element =>
    A($table(...xs), { class: 'tabularize' });
const $tr = (...xs: Node[]): Element => E('tr')(...xs.map((e) => E('td')(e)));

function render() {
    function newGame(manifold: string, size: string) {
        return (e: Event) => {
            confirm(`Start ${size} ${manifold} game?`);
        };
    }

    function row(manifold: string, name: string) {
        elementOpen('tr');

        elementOpen('td');
        elementOpen('b');
        text(name);
        elementClose('b');
        elementClose('td');

        for (const size of ['9x9', '13x13', '19x19']) {
            elementOpen('td');
            elementOpen(
                'button',
                null,
                null,
                'onClick',
                newGame(manifold, size)
            );
            text(size);
            elementClose('button');
            elementClose('td');
        }

        elementClose('tr');
    }

    elementOpen('div');
    text('Start a game at this table:');
    elementOpen('table', null, null, 'class', 'tabularize');
    for (const [manifold, name] of [
        ['normal', 'Normal'],
        ['cylinder', 'Cylinder'],
        ['mobius', 'Mobius strip'],
        ['torus', 'Torus'],
        ['klein', 'Klein bottle'],
        ['projective', 'Projective plane'],
    ]) {
        row(manifold, name);
    }
    elementClose('table');
    elementClose('div');
}

const newGameMenu = (): Node => {
    function newGame(manifold: string, size: string) {
        return (e: Event) => {
            confirm(`Start ${size} ${manifold} game?`);
        };
    }

    const $row = (manifold: string, name: string) =>
        $tr(
            $b(T(name)),
            $button(newGame(manifold, '9x9'), T('9x9')),
            $button(newGame(manifold, '13x13'), T('13x13')),
            $button(newGame(manifold, '19x19'), T('19x19'))
        );

    return $_(
        $_(T('Start a game at this table:')),
        $tabularize(
            $row('normal', 'Normal'),
            $row('cylinder', 'Cylinder'),
            $row('mobius', 'Mobius strip'),
            $row('torus', 'Torus'),
            $row('klein', 'Klein bottle'),
            $row('projective', 'Projective plane')
        )
    );
};

(window as any).startGame = (init: TableDetail, game: Element): void => {
    function update() {
        patchIncrementalDom(game, () => render());
    }
    update();
};
