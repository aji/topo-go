import { TableDetail } from '../api-v1/types';
import { Routes } from '../api-v1/routes';
import createClient from '../api-v1/client';

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
    game.appendChild(newGameMenu());
};
