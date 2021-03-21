import { narrowTsOptions } from '@bazel/typescript';

export enum Tile {
    empty = 0,
    black = 1,
    white = 2,
}

export type Captures = {
    [Tile.empty]: number;
    [Tile.black]: number;
    [Tile.white]: number;
};

export function not(t: Tile): Tile {
    switch (t) {
        case Tile.empty:
            return Tile.empty;
        case Tile.black:
            return Tile.white;
        case Tile.white:
            return Tile.black;
    }
}

export interface Manifold<C> {
    origin(): C;
    adj(x: C): Array<C>;
}

export interface Board<C> {
    copy(): Board<C>;
    get(x: C): Tile;
    set(x: C, t: Tile): void;
}

export type XY = { x: number; y: number };

export class MobiusStrip implements Manifold<XY> {
    sizeX: number;
    sizeY: number;

    constructor(options: { sizeX: number; sizeY: number }) {
        this.sizeX = options.sizeX;
        this.sizeY = options.sizeY;
    }

    static new(sizeX: number, sizeY: number) {
        return new MobiusStrip({ sizeX, sizeY });
    }

    origin(): XY {
        return { x: 0, y: 0 };
    }

    adj(coord: XY): Array<XY> {
        const adj = new Array();
        this._adjIf(adj, coord, -1, 0);
        this._adjIf(adj, coord, 1, 0);
        this._adjIf(adj, coord, 0, -1);
        this._adjIf(adj, coord, 0, 1);
        return adj;
    }

    _adjIf(adj: Array<XY>, coord: XY, dx: number, dy: number) {
        const res = this._resolve(coord, dx, dy);
        if (res !== null) adj.push(res);
    }

    _resolve(coord: XY, dx: number, dy: number): XY | null {
        if (coord.y + dy < 0 || this.sizeY <= coord.y + dy) return null;
        if (coord.x + dx < 0)
            return {
                x: coord.x + dx + this.sizeX,
                y: this.sizeY - coord.y - 1,
            };
        if (this.sizeX <= coord.x + dx)
            return {
                x: coord.x + dx - this.sizeX,
                y: this.sizeY - coord.y - 1,
            };
        return { x: coord.x + dx, y: coord.y + dy };
    }
}

export class BoardXY implements Board<XY> {
    tiles: Array<Tile>;
    sizeX: number;
    sizeY: number;

    constructor(options: { tiles: Array<Tile>; sizeX: number; sizeY: number }) {
        this.tiles = options.tiles;
        this.sizeX = options.sizeX;
        this.sizeY = options.sizeY;
    }

    static new(sizeX: number, sizeY: number) {
        return new BoardXY({
            tiles: new Array(sizeX * sizeY).map(() => Tile.empty),
            sizeX: sizeX,
            sizeY: sizeY,
        });
    }

    copy(): BoardXY {
        return new BoardXY({
            tiles: this.tiles.slice(),
            sizeX: this.sizeX,
            sizeY: this.sizeY,
        });
    }

    get(coord: XY): Tile {
        return this.tiles[coord.y * this.sizeX + coord.x];
    }

    set(coord: XY, t: Tile) {
        this.tiles[coord.y * this.sizeX + coord.x] = t;
    }
}

export type Group<C> = {
    color: Tile;
    coords: Set<C>;
    liberties: number;
};

export function group<C>(
    manifold: Manifold<C>,
    board: Board<C>,
    at: C
): Group<C> | null {
    const who = board.get(at);
    const notWho = not(who);

    const res = { color: who, coords: new Set<C>(), liberties: 0 };

    if (who === Tile.empty) {
        return null;
    }

    function _group(at: C) {
        res.coords.add(at);
        for (const adj of manifold.adj(at)) {
            switch (board.get(adj)) {
                case Tile.empty:
                    res.liberties += 1;
                    break;
                case who:
                    if (!res.coords.has(adj)) {
                        _group(adj);
                    }
                    break;
                case notWho:
                    break;
            }
        }
    }

    _group(at);
    return res;
}

class IllegalMove extends Error {}

export class Game<C> {
    manifold: Manifold<C>;
    board: Board<C>;
    captures: Captures;

    constructor(options: {
        manifold: Manifold<C>;
        board: Board<C>;
        captures: Captures;
    }) {
        this.manifold = options.manifold;
        this.board = options.board;
        this.captures = options.captures;
    }

    static new<C>(manifold: Manifold<C>, board: Board<C>): Game<C> {
        return new Game<C>({
            manifold,
            board,
            captures: { [Tile.empty]: 0, [Tile.black]: 0, [Tile.white]: 0 },
        });
    }

    play(coord: C, t: Tile): Game<C> {
        const manifold = this.manifold;
        const board = this.board.copy();
        const captures = Object.assign({}, this.captures);

        if (board.get(coord) !== Tile.empty) {
            throw new IllegalMove();
        }

        board.set(coord, t);

        let suicide = group(manifold, board, coord)?.liberties == 0;

        for (const adj of manifold.adj(coord)) {
            const g = group(manifold, board, adj);
            if (g === null) {
                continue;
            }
            if (g.color !== t && g.liberties === 0) {
                suicide = false;
                captures[t] = (captures[t] || 0) + g.coords.size;
                g.coords.forEach((at) => board.set(at, Tile.empty));
            }
        }

        if (suicide) {
            throw new IllegalMove();
        }

        return new Game<C>({ manifold, board, captures });
    }
}

export function mobiusGo(sizeX: number, sizeY: number): Game<XY> {
    return Game.new(MobiusStrip.new(sizeX, sizeY), BoardXY.new(sizeX, sizeY));
}
