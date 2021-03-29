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
}

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

export const tileArrayDigits = '.XO';

export const tileArrayCodec: Codec<Tile[], string> = {
    encode: (tiles: Tile[]): string =>
        tiles.map((x) => tileArrayDigits.charAt(x)).join(''),
    decode: (encoded: string): Tile[] =>
        Array.from(encoded).map((c) => tileArrayDigits.indexOf(c)),
};

//
//
//
// MOVE --------------------------------------------------------------
//

export type Move = {
    board: Tile[];
};

export type MoveEncoded = {
    b: string;
};

export const moveCodec: Codec<Move, MoveEncoded> = {
    encode: (m: Move): MoveEncoded => ({
        b: tileArrayCodec.encode(m.board),
    }),
    decode: (me: MoveEncoded): Move => ({
        board: tileArrayCodec.decode(me.b),
    }),
};

//
//
//
// TABLE -------------------------------------------------------------
//

export type TableAttrs = {
    manifold?: ManifoldID;
};

export type Table = {
    attrs: TableAttrs;
    moves: Move[];
};

export type TableEncoded = {
    a: TableAttrs;
    m: MoveEncoded[];
};

export const tableCodec: Codec<Table, TableEncoded> = {
    encode: (t: Table): TableEncoded => ({
        a: t.attrs,
        m: t.moves.map(moveCodec.encode),
    }),

    decode: (te: TableEncoded): Table => ({
        attrs: te.a,
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
    | { t: 'r'; v: TableAttrs }
    | { t: 't'; v: number }
    | { t: 'm'; v: MoveEncoded[] };

// prettier-ignore
export const tableTransitionCodec: Codec<
    TableTransition,
    TableTransitionEncoded
> = {
    encode: (tt: TableTransition): TableTransitionEncoded => {
        switch (tt.t) {
            case 'reset': return { t: 'r', v: tt.v };
            case 'trunc': return { t: 't', v: tt.v };
            case 'moves': return { t: 'm', v: tt.v.map(moveCodec.encode) };
        }
    },
    decode: (tte: TableTransitionEncoded): TableTransition => {
        switch (tte.t) {
            case 'r': return { t: 'reset', v: tte.v };
            case 't': return { t: 'trunc', v: tte.v };
            case 'm': return { t: 'moves', v: tte.v.map(moveCodec.decode) };
        }
    },
};

// prettier-ignore
export function tableApply(s: Table, tt: TableTransition): Table {
    switch (tt.t) {
        case 'reset': return { attrs: Object.assign({}, tt.v), moves: [] };
        case 'trunc': return { ...s, moves: s.moves.slice(0, tt.v) };
        case 'moves': return { ...s, moves: s.moves.concat(tt.v) };
    }
}

//
//
//
// STATE MACHINE -----------------------------------------------------
//

export type Applier<S, T> = (state: S, transition: T) => S;

export class StateMachine<S, T> {
    _seqno: number;
    _state: S;
    _applier: Applier<S, T>;

    constructor(seqno: number, state: S, applier: Applier<S, T>) {
        this._seqno = seqno;
        this._state = state;
        this._applier = applier;
    }

    applyBatch(seqno: number, batch: T[]) {
        if (seqno != this._seqno + 1) {
            throw new Error(`expected seqno ${this._seqno + 1}, got ${seqno}`);
        }

        this._seqno += 1;
        for (const tr of batch) {
            this._state = this._applier(this._state, tr);
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
    | { t: 'play'; at: string };

export function tableActionToBatch(
    t: Table,
    a: TableAction
): TableTransition[] {
    switch (a.t) {
        case 'reset':
            return [{ t: 'reset', v: a.v }];
        case 'undo':
            return [{ t: 'trunc', v: t.moves.length - 1 }];
        case 'play':
            return []; // TODO: Consult the rules of the game
    }
}
