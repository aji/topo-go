const notNull = <T>(x: undefined | null | T, msg: string): T => {
    if (x === undefined || x === null) {
        throw new Error(msg);
    }
    return x;
};

export type Codec<T, E> = {
    encode: (fr: T) => E;
    decode: (fr: E) => T;
};

//
//
//
// MANIFOLD ----------------------------------------------------------
//

export type RC = { r: number; c: number };

export type ManifoldType =
    | 'normal'
    | 'cylinder'
    | 'mobius'
    | 'torus'
    | 'klein'
    | 'projective';

export type ManifoldSize = '9x9' | '13x13' | '19x19';

export type ManifoldID =
    | 'normal/9x9'
    | 'normal/13x13'
    | 'normal/19x19'
    | 'cylinder/9x9'
    | 'cylinder/13x13'
    | 'cylinder/19x19'
    | 'mobius/9x9'
    | 'mobius/13x13'
    | 'mobius/19x19'
    | 'torus/9x9'
    | 'torus/13x13'
    | 'torus/19x19'
    | 'klein/9x9'
    | 'klein/13x13'
    | 'klein/19x19'
    | 'projective/9x9'
    | 'projective/13x13'
    | 'projective/19x19';

export type ManifoldJoin = 'none' | 'flat' | 'flip';

export const manifoldType = (s: ManifoldID): null | ManifoldType =>
    (s.match(/(.+)\/\d+x\d+/) || [null])[1] as ManifoldType;
export const manifoldSize = (s: ManifoldID): null | ManifoldSize =>
    (s.match(/.+\/(\d+x\d+)/) || [null])[1] as ManifoldSize;

export const manifoldTypeJoinCols: { [key: string]: ManifoldJoin } = {
    normal: 'none',
    cylinder: 'flat',
    mobius: 'flip',
    torus: 'flat',
    klein: 'flat',
    projective: 'flip',
};

export const manifoldTypeJoinRows: { [key: string]: ManifoldJoin } = {
    normal: 'none',
    cylinder: 'none',
    mobius: 'none',
    torus: 'flat',
    klein: 'flip',
    projective: 'flip',
};

export const manifoldSizeWidth = (s: ManifoldSize): number =>
    Number.parseInt((s.match(/\d+x(\d+)/) || ['-1'])[1]);
export const manifoldSizeHeight = (s: ManifoldSize): number =>
    Number.parseInt((s.match(/(\d+)x\d+/) || ['-1'])[1]);

export class Manifold {
    id: ManifoldID;
    type: ManifoldType;
    size: ManifoldSize;
    joinCols: ManifoldJoin;
    joinRows: ManifoldJoin;
    sizeCols: number;
    sizeRows: number;

    constructor(id: ManifoldID) {
        this.id = id;
        this.type = notNull(manifoldType(this.id), `no type: ${this.id}`);
        this.size = notNull(manifoldSize(this.id), `no size: ${this.id}`);
        this.joinCols = notNull(
            manifoldTypeJoinCols[this.type],
            `no joinCols: ${this.type}`
        );
        this.joinRows = notNull(
            manifoldTypeJoinRows[this.type],
            `no joinRows: ${this.type}`
        );
        this.sizeCols = notNull(
            manifoldSizeWidth(this.size),
            `no sizeWidth: ${this.size}`
        );
        this.sizeRows = notNull(
            manifoldSizeHeight(this.size),
            `no sizeHeight: ${this.size}`
        );
    }

    // prettier-ignore
    canonicalize(at: RC): null | RC {
        let r = at.r;
        let c = at.c;

        while (r < 0) {
            switch (this.joinRows) {
                case 'none': return null;
                case 'flip': c = this.sizeCols - c - 1; // fallthrough
                case 'flat': r += this.sizeRows; break;
            }
        }

        while (this.sizeRows <= r) {
            switch (this.joinRows) {
                case 'none': return null;
                case 'flip': c = this.sizeCols - c - 1; // fallthrough
                case 'flat': r -= this.sizeRows; break;
            }
        }

        while (c < 0) {
            switch (this.joinCols) {
                case 'none': return null;
                case 'flip': r = this.sizeRows - r - 1; // fallthrough
                case 'flat': c += this.sizeCols; break;
            }
        }

        while (this.sizeCols <= c) {
            switch (this.joinCols) {
                case 'none': return null;
                case 'flip': r = this.sizeRows - r - 1; // fallthrough
                case 'flat': c -= this.sizeCols; break;
            }
        }

        return { r, c };
    }

    adj({ r, c }: RC): RC[] {
        return [
            this.canonicalize({ r, c: c + 1 }),
            this.canonicalize({ r, c: c - 1 }),
            this.canonicalize({ r: r + 1, c }),
            this.canonicalize({ r: r - 1, c }),
        ].filter((c): c is RC => c !== null);
    }
}

export const ALL_MANIFOLD_IDS: ManifoldID[] = [
    'normal/9x9',
    'normal/13x13',
    'normal/19x19',
    'cylinder/9x9',
    'cylinder/13x13',
    'cylinder/19x19',
    'mobius/9x9',
    'mobius/13x13',
    'mobius/19x19',
    'torus/9x9',
    'torus/13x13',
    'torus/19x19',
    'klein/9x9',
    'klein/13x13',
    'klein/19x19',
    'projective/9x9',
    'projective/13x13',
    'projective/19x19',
];

export const ALL_MANIFOLDS: Manifold[] = ALL_MANIFOLD_IDS.map(
    (m) => new Manifold(m)
);

//
//
//
// TILE --------------------------------------------------------------
//

export enum Tile {
    empty = 0,
    black = 1,
    white = 2,
}

export type Captures = {
    [Tile.black]: number;
    [Tile.white]: number;
};

export const tileNot = {
    [Tile.empty]: Tile.empty,
    [Tile.black]: Tile.white,
    [Tile.white]: Tile.black,
};

export const tileArrayDigits = '.XO';

export const tileArrayCodec: Codec<Tile[], string> = {
    encode: (tiles: Tile[]): string =>
        tiles.map((x) => tileArrayDigits.charAt(x)).join(''),
    decode: (encoded: string): Tile[] =>
        Array.from(encoded).map((c) => tileArrayDigits.indexOf(c)),
};

export const capturesCodec: Codec<Captures, string> = {
    encode: (c: Captures): string => `${c[Tile.black]},${c[Tile.white]}`,
    decode: (ce: string): Captures => {
        const m = ce.match(/(\d+),(\d+)/);
        if (m === null) {
            throw new Error(`Invalid captures encoding: ${ce}`);
        }
        return {
            [Tile.black]: Number.parseInt(m[1]),
            [Tile.white]: Number.parseInt(m[2]),
        };
    },
};

//
//
//
// BOARD -------------------------------------------------------------
//

export class Board {
    constructor(public manifold: Manifold, public tiles: Tile[]) {}

    static new(m: Manifold) {
        const tiles = [];
        for (let i = m.sizeRows * m.sizeCols; i-- > 0; ) {
            tiles.push(Tile.empty);
        }
        return new Board(m, tiles);
    }

    copy() {
        return new Board(this.manifold, Array.from(this.tiles));
    }

    equals(other: Board): boolean {
        if (
            this.manifold.id !== other.manifold.id ||
            this.tiles.length !== other.tiles.length
        ) {
            return false;
        }
        for (let i = 0; i < this.tiles.length; i++) {
            if (this.tiles[i] !== other.tiles[i]) {
                return false;
            }
        }
        return true;
    }

    get(at: RC): Tile | null {
        let x = this.manifold.canonicalize(at);
        if (x === null) {
            return null;
        }
        return this.tiles[x.c + this.manifold.sizeCols * x.r];
    }

    set(at: RC, t: Tile) {
        let x = this.manifold.canonicalize(at);
        if (x !== null) {
            this.tiles[x.c + this.manifold.sizeCols * x.r] = t;
        }
    }
}

export type BoardEncoded = {
    m: ManifoldID;
    t: string;
};

export const boardCodec: Codec<Board, BoardEncoded> = {
    encode: (b: Board): BoardEncoded => ({
        m: b.manifold.id,
        t: tileArrayCodec.encode(b.tiles),
    }),
    decode: (be: BoardEncoded): Board =>
        new Board(new Manifold(be.m), tileArrayCodec.decode(be.t)),
};

//
//
//
// MOVE --------------------------------------------------------------
//

export type Move = {
    captures: Captures;
    board: Board;
};

export type MoveEncoded = {
    c: string;
    b: BoardEncoded;
};

export const moveCodec: Codec<Move, MoveEncoded> = {
    encode: (m: Move): MoveEncoded => ({
        c: capturesCodec.encode(m.captures),
        b: boardCodec.encode(m.board),
    }),
    decode: (me: MoveEncoded): Move => ({
        captures: capturesCodec.decode(me.c),
        board: boardCodec.decode(me.b),
    }),
};

//
//
//
// TABLE -------------------------------------------------------------
//

export type TableAttrs = {
    manifold: Manifold;
};

export type TableAttrsEncoded = {
    m: ManifoldID;
};

export const tableAttrsCodec: Codec<TableAttrs, TableAttrsEncoded> = {
    encode: (t: TableAttrs): TableAttrsEncoded => ({ m: t.manifold.id }),
    decode: (te: TableAttrsEncoded): TableAttrs => ({
        manifold: new Manifold(te.m),
    }),
};

export type Table = {
    attrs: TableAttrs;
    moves: Move[];
};

export type TableEncoded = {
    a: TableAttrsEncoded;
    m: MoveEncoded[];
};

export const tableCodec: Codec<Table, TableEncoded> = {
    encode: (t: Table): TableEncoded => ({
        a: tableAttrsCodec.encode(t.attrs),
        m: t.moves.map(moveCodec.encode),
    }),

    decode: (te: TableEncoded): Table => ({
        attrs: tableAttrsCodec.decode(te.a),
        moves: te.m.map(moveCodec.decode),
    }),
};

//
//
//
// TABLE TRANSITIONS ----------------------------------------------
//

export type TableTransition =
    | { t: 'reset'; v: TableAttrs }
    | { t: 'trunc'; v: number }
    | { t: 'moves'; v: Move[] };

export type TableTransitionEncoded =
    | { t: 'r'; v: TableAttrsEncoded }
    | { t: 't'; v: number }
    | { t: 'm'; v: MoveEncoded[] };

// prettier-ignore
export const tableTransitionCodec: Codec<
    TableTransition,
    TableTransitionEncoded
> = {
    encode: (tt: TableTransition): TableTransitionEncoded => {
        switch (tt.t) {
            case 'reset': return { t: 'r', v: tableAttrsCodec.encode(tt.v) };
            case 'trunc': return { t: 't', v: tt.v };
            case 'moves': return { t: 'm', v: tt.v.map(moveCodec.encode) };
        }
    },
    decode: (tte: TableTransitionEncoded): TableTransition => {
        switch (tte.t) {
            case 'r': return { t: 'reset', v: tableAttrsCodec.decode(tte.v) };
            case 't': return { t: 'trunc', v: tte.v };
            case 'm': return { t: 'moves', v: tte.v.map(moveCodec.decode) };
        }
    },
};

export function tableApply(s: Table | undefined, tt: TableTransition): Table {
    switch (tt.t) {
        case 'reset':
            return {
                attrs: Object.assign({}, tt.v),
                moves: [
                    {
                        captures: { [Tile.black]: 0, [Tile.white]: 0 },
                        board: Board.new(tt.v.manifold),
                    },
                ],
            };

        case 'trunc':
            if (s === undefined)
                throw new Error(`First TableTransition must be 'reset'`);
            return { ...s, moves: s.moves.slice(0, tt.v) };

        case 'moves':
            if (s === undefined)
                throw new Error(`First TableTransition must be 'reset'`);
            return { ...s, moves: s.moves.concat(tt.v) };
    }
}

//
//
//
// STATE MACHINE -----------------------------------------------------
//

export type Applier<S, T> = (state: S | undefined, transition: T) => S;

export class StateMachine<S, T> {
    constructor(
        public seqno: number,
        public applier: Applier<S, T>,
        public state: S | undefined
    ) {}

    applyBatch(seqno: number, batch: T[]) {
        if (seqno != this.seqno + 1) {
            throw new Error(`expected seqno ${this.seqno + 1}, got ${seqno}`);
        }

        this.seqno += 1;
        for (const tr of batch) {
            this.state = this.applier(this.state, tr);
        }
    }
}

//
//
//
// TABLE ACTIONS -----------------------------------------------------
//

export type TableAction =
    | { t: 'reset'; v: TableAttrs }
    | { t: 'undo' }
    | { t: 'play'; at: RC };

export function tableActionToBatch(
    t: Table | undefined,
    a: TableAction
): TableTransition[] {
    switch (a.t) {
        case 'reset':
            return [{ t: 'reset', v: a.v }];

        case 'undo':
            if (t === undefined) {
                throw new Error(`First table action must be 'reset'`);
            }
            if (t.moves.length > 1) {
                return [{ t: 'trunc', v: t.moves.length - 1 }];
            } else {
                return [];
            }

        case 'play':
            if (t === undefined) {
                throw new Error(`First table action must be 'reset'`);
            }
            const toMove = t.moves.length % 2 == 1 ? Tile.black : Tile.white;
            const move = play(t, a.at, toMove);
            if (isIllegal(move)) {
                return [];
            } else {
                return [
                    {
                        t: 'moves',
                        v: [move],
                    },
                ];
            }
    }
}

//
//
//
// GAME RULES --------------------------------------------------------
//

export type Group = {
    color: Tile;
    coords: Set<RC>;
    liberties: number;
};

export function group(manifold: Manifold, board: Board, at: RC): Group | null {
    const who = board.get(at);

    if (who === null || who === Tile.empty) {
        return null;
    }

    const notWho = tileNot[who];
    const visited = Board.new(manifold);
    const res = { color: who, coords: new Set<RC>(), liberties: 0 };

    function _group(at: RC) {
        res.coords.add(at);
        visited.set(at, Tile.black);
        for (const adj of manifold.adj(at)) {
            switch (board.get(adj)) {
                case Tile.empty:
                    res.liberties += 1;
                    break;
                case who:
                    if (visited.get(adj) === Tile.empty) {
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

const ILLEGAL = Symbol('Illegal move');

export class IllegalMove {
    [ILLEGAL]: boolean;
    constructor(public move: RC, public reason: string) {
        this[ILLEGAL] = true;
    }
}

export function isIllegal(x: any): x is IllegalMove {
    return x[ILLEGAL] !== undefined;
}

export function play(tbl: Table, at: RC, t: Tile): Move | IllegalMove {
    const manifold = tbl.attrs.manifold;
    const lastMove = tbl.moves[tbl.moves.length - 1];
    const captures = Object.assign({}, lastMove.captures);
    const board = lastMove.board.copy();

    if (t === Tile.empty) {
        return new IllegalMove(at, 'cannot play empty');
    }

    if (board.get(at) !== Tile.empty) {
        return new IllegalMove(at, 'not empty');
    }

    board.set(at, t);

    let suicide = group(manifold, board, at)?.liberties == 0;

    for (const adj of manifold.adj(at)) {
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
        return new IllegalMove(at, 'suicidal');
    }

    for (let i = 0; i < tbl.moves.length; i++) {
        if (board.equals(tbl.moves[i].board)) {
            return new IllegalMove(at, 'ko rule');
        }
    }

    return { captures, board };
}
