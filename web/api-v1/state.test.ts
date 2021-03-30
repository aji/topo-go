import * as S from './state';

const normal9x9m = new S.Manifold('normal/9x9');
const cylinder9x9m = new S.Manifold('cylinder/9x9');
const mobius9x9m = new S.Manifold('mobius/9x9');
const torus9x9m = new S.Manifold('torus/9x9');
const klein9x9m = new S.Manifold('klein/9x9');
const projective9x9m = new S.Manifold('projective/9x9');

const normal9x9 = normal9x9m.canonicalize.bind(normal9x9m);
const cylinder9x9 = cylinder9x9m.canonicalize.bind(cylinder9x9m);
const mobius9x9 = mobius9x9m.canonicalize.bind(mobius9x9m);
const torus9x9 = torus9x9m.canonicalize.bind(torus9x9m);
const klein9x9 = klein9x9m.canonicalize.bind(klein9x9m);
const projective9x9 = projective9x9m.canonicalize.bind(projective9x9m);

describe('Manifold.canonicalize', () => {
    const rc = (r: number, c: number) => ({ r, c });

    it('wraps normal correctly', () => {
        expect(normal9x9(rc(10, 3))).toBeNull();
        expect(normal9x9(rc(-8, 3))).toBeNull();
        expect(normal9x9(rc(3, 10))).toBeNull();
        expect(normal9x9(rc(3, -8))).toBeNull();
    });

    it('wraps cylinder correctly', () => {
        expect(cylinder9x9(rc(10, 3))).toBeNull();
        expect(cylinder9x9(rc(-8, 3))).toBeNull();
        expect(cylinder9x9(rc(3, 10))).toStrictEqual(rc(3, 1));
        expect(cylinder9x9(rc(3, -8))).toStrictEqual(rc(3, 1));
    });

    it('wraps mobius correctly', () => {
        expect(mobius9x9(rc(10, 3))).toBeNull();
        expect(mobius9x9(rc(-8, 3))).toBeNull();
        expect(mobius9x9(rc(3, 10))).toStrictEqual(rc(5, 1));
        expect(mobius9x9(rc(3, -8))).toStrictEqual(rc(5, 1));
    });

    it('wraps torus correctly', () => {
        expect(torus9x9(rc(10, 3))).toStrictEqual(rc(1, 3));
        expect(torus9x9(rc(-8, 3))).toStrictEqual(rc(1, 3));
        expect(torus9x9(rc(3, 10))).toStrictEqual(rc(3, 1));
        expect(torus9x9(rc(3, -8))).toStrictEqual(rc(3, 1));
    });

    it('wraps klein correctly', () => {
        expect(klein9x9(rc(10, 3))).toStrictEqual(rc(1, 5));
        expect(klein9x9(rc(-8, 3))).toStrictEqual(rc(1, 5));
        expect(klein9x9(rc(3, 10))).toStrictEqual(rc(3, 1));
        expect(klein9x9(rc(3, -8))).toStrictEqual(rc(3, 1));
    });

    it('wraps projective correctly', () => {
        expect(projective9x9(rc(10, 3))).toStrictEqual(rc(1, 5));
        expect(projective9x9(rc(-8, 3))).toStrictEqual(rc(1, 5));
        expect(projective9x9(rc(3, 10))).toStrictEqual(rc(5, 1));
        expect(projective9x9(rc(3, -8))).toStrictEqual(rc(5, 1));
    });
});

const codecTests = <T, E>(
    codec: S.Codec<T, E>,
    decoded: T,
    encoded: E
) => () => {
    it('encode(decode(e)) = e', () => {
        expect(codec.encode(codec.decode(encoded))).toStrictEqual(encoded);
    });

    it('decode(encode(d)) = d', () => {
        expect(codec.decode(codec.encode(decoded))).toStrictEqual(decoded);
    });

    it('encode(d) = e', () => {
        expect(codec.encode(decoded)).toStrictEqual(encoded);
    });

    it('decode(e) = d', () => {
        expect(codec.decode(encoded)).toStrictEqual(decoded);
    });
};

const someTileArray = [0, 1, 2, 0, 0, 0, 0, 2, 1, 2, 1, 2, 1, 2, 2, 0, 0, 0];
const someMove = {
    captures: { [S.Tile.black]: 3, [S.Tile.white]: 5 },
    board: new S.Board(new S.Manifold('normal/19x19'), someTileArray),
};
const someTableAttrs: S.TableAttrs = { manifold: mobius9x9m };
const someTable = { attrs: someTableAttrs, moves: [someMove] };

const someTileArrayEncoded = '.XO....OXOXOXOO...';
const someMoveEncoded = {
    c: '3,5',
    b: { m: 'normal/19x19' as S.ManifoldID, t: someTileArrayEncoded },
};
const someTableAttrsEncoded = { m: 'mobius/9x9' as S.ManifoldID };
const someTableEncoded = { a: someTableAttrsEncoded, m: [someMoveEncoded] };

describe(
    'tileArrayCodec',
    codecTests(S.tileArrayCodec, someTileArray, someTileArrayEncoded)
);
describe('moveCodec', codecTests(S.moveCodec, someMove, someMoveEncoded));
describe(
    'tableAttrsCodec',
    codecTests(S.tableAttrsCodec, someTableAttrs, someTableAttrsEncoded)
);
describe('tableCodec', codecTests(S.tableCodec, someTable, someTableEncoded));

describe(
    'tableTransitionCodec (reset)',
    codecTests(
        S.tableTransitionCodec,
        { t: 'reset', v: { manifold: mobius9x9m } },
        { t: 'r', v: { m: 'mobius/9x9' } }
    )
);

describe(
    'tableTransitionCodec (trunc)',
    codecTests(S.tableTransitionCodec, { t: 'trunc', v: 5 }, { t: 't', v: 5 })
);

describe(
    'tableTransitionCodec (moves)',
    codecTests(
        S.tableTransitionCodec,
        { t: 'moves', v: [someMove] },
        { t: 'm', v: [someMoveEncoded] }
    )
);

describe('tableApply', () => {
    const apply = (tt: S.TableTransition) => S.tableApply(someTable, tt);

    it('applies reset correctly', () => {
        const manifold = new S.Manifold('mobius/13x13');
        const nextTable = apply({
            t: 'reset',
            v: { manifold },
        });
        const move = {
            board: S.Board.new(manifold),
            captures: { [S.Tile.black]: 0, [S.Tile.white]: 0 },
        };
        expect(nextTable).toStrictEqual({
            attrs: { manifold },
            moves: [move],
        });
    });

    it('applies trunc(0) correctly', () => {
        expect(apply({ t: 'trunc', v: 0 })).toStrictEqual({
            attrs: someTable.attrs,
            moves: [],
        });
    });

    it('applies trunc(10) correctly', () => {
        expect(apply({ t: 'trunc', v: 10 })).toStrictEqual(someTable);
    });

    it('applies moves correctly', () => {
        const aMove = {
            captures: {
                [S.Tile.black]: 7,
                [S.Tile.white]: 8,
            },
            board: new S.Board(normal9x9m, [2, 1, 1, 2, 1]),
        };
        expect(apply({ t: 'moves', v: [aMove, aMove] })).toStrictEqual({
            attrs: someTable.attrs,
            moves: [someMove, aMove, aMove],
        });
    });
});

describe('StateMachine', () => {
    type St = { n: number };
    type Tr = { d: number };

    const seq = 100;
    const newStateMachine = (n: number): S.StateMachine<St, Tr> =>
        new S.StateMachine(seq, (s, t) => ({ n: (s?.n || 0) + t.d }), { n });

    it('applies empty batches correctly', () => {
        const m = newStateMachine(5);
        expect(m.state?.n).toBe(5);
        m.applyBatch(seq + 1, []);
        expect(m.state?.n).toBe(5);
        m.applyBatch(seq + 2, []);
        expect(m.state?.n).toBe(5);
    });

    it('applies singleton batches correctly', () => {
        const m = newStateMachine(5);
        expect(m.state?.n).toBe(5);
        m.applyBatch(seq + 1, [{ d: 5 }]);
        expect(m.state?.n).toBe(10);
        m.applyBatch(seq + 2, [{ d: 4 }]);
        expect(m.state?.n).toBe(14);
    });

    it('applies big batches correctly', () => {
        const m = newStateMachine(5);
        expect(m.state?.n).toBe(5);
        m.applyBatch(seq + 1, [{ d: 5 }, { d: 4 }]);
        expect(m.state?.n).toBe(14);
        m.applyBatch(seq + 2, [{ d: 3 }, { d: 2 }]);
        expect(m.state?.n).toBe(19);
    });

    it('errors on the wrong sequence number', () => {
        const m = newStateMachine(5);
        expect(() => m.applyBatch(seq + 2, [])).toThrow();
    });
});

describe('tableActionToBatch', () => {
    const convert = (ta: S.TableAction): S.TableTransition[] =>
        S.tableActionToBatch(someTable, ta);

    it('converts reset correctly', () => {
        const attrs: S.TableAttrs = { manifold: new S.Manifold('klein/19x19') };
        expect(convert({ t: 'reset', v: attrs })).toStrictEqual([
            { t: 'reset', v: { manifold: new S.Manifold('klein/19x19') } },
        ]);
    });

    // TODO: test undo

    it('converts play correctly', () => {
        const manifold = normal9x9m;
        const board = S.Board.new(manifold);

        const tbl = new S.StateMachine(0, S.tableApply, undefined);
        const step = (a: S.TableAction) =>
            tbl.applyBatch(tbl.seqno + 1, S.tableActionToBatch(tbl.state, a));

        step({ t: 'reset', v: { manifold } });
        step({ t: 'play', at: { r: 0, c: 0 } });
        step({ t: 'play', at: { r: 0, c: 1 } });
        step({ t: 'play', at: { r: 1, c: 0 } });
        step({ t: 'play', at: { r: 1, c: 1 } });
        step({ t: 'play', at: { r: 2, c: 0 } });
        step({ t: 'play', at: { r: 2, c: 1 } });
        step({ t: 'play', at: { r: 8, c: 8 } });
        step({ t: 'play', at: { r: 3, c: 0 } });
    });
});

describe('play', () => {
    function example(
        name: string,
        spec: string,
        capturedBlack: number = 0,
        capturedWhite: number = 0
    ) {
        let tokens = spec.split(/\s+/g).filter(Boolean);
        if (tokens.length !== 2 * 9 * 9) {
            throw new Error(`${name}: bad spec:\n${spec}`);
        }

        const moves = new Array();
        const expectedMove: S.Move = {
            captures: {
                [S.Tile.black]: capturedBlack,
                [S.Tile.white]: capturedWhite,
            },
            board: S.Board.new(normal9x9m),
        };

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const tokLeft = tokens[r * 18 + c];
                const tokRight = tokens[r * 18 + c + 9];

                if (tokLeft !== '.') {
                    const n = Number.parseInt(tokLeft);
                    while (moves.length < n) {
                        moves.push(null);
                    }
                    moves[n - 1] = { r, c };
                }

                switch (tokRight) {
                    case 'X':
                        expectedMove.board.set({ r, c }, S.Tile.black);
                        break;
                    case 'O':
                        expectedMove.board.set({ r, c }, S.Tile.white);
                        break;
                }
            }
        }

        it(name, () => {
            const tbl = new S.StateMachine(0, S.tableApply, undefined);
            const step = (a: S.TableAction) =>
                tbl.applyBatch(
                    tbl.seqno + 1,
                    S.tableActionToBatch(tbl.state, a)
                );

            step({ t: 'reset', v: { manifold: normal9x9m } });
            for (let i = 0; i < moves.length; i++) {
                if (!moves[i]) {
                    throw new Error(`${name}: missing move ${i + 1}`);
                }
                step({ t: 'play', at: moves[i] });
            }

            if (tbl.state === undefined) {
                throw new Error('state is undefined');
            }

            expect(tbl.state.moves.length).toBe(moves.length + 1);
            expect(tbl.state.moves[tbl.state.moves.length - 1]).toStrictEqual(
                expectedMove
            );
        });
    }

    example(
        'hello world',
        `.  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .`
    );

    example(
        'placing stones',
        `1  2  .  .  .  .  .  .  .     X  O  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .`
    );

    example(
        'single capture',
        `3  .  .  .  .  .  .  .  .     X  .  .  .  .  .  .  .  .
         5  .  .  .  .  .  .  .  .     X  .  .  .  .  .  .  .  .
         7  .  .  .  .  .  .  .  .     X  .  .  .  .  .  .  .  .
         .  .  .  .  2  .  .  .  .     .  .  .  .  O  .  .  .  .
         .  .  .  8  1  4  .  .  .     .  .  .  O  .  O  .  .  .
         .  .  .  .  6  .  .  .  .     .  .  .  .  O  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .`,
        0,
        1
    );

    example(
        'two capture',
        `5  .  .  .  .  .  .  .  .     X  .  .  .  .  .  .  .  .
         7  .  .  .  .  .  .  .  .     X  .  .  .  .  .  .  .  .
         9  .  .  .  .  .  .  .  .     X  .  .  .  .  .  .  .  .
         11 .  .  .  2  .  .  .  .     X  .  .  .  O  .  .  .  .
         .  .  .  12 1  4  .  .  .     .  .  .  O  .  O  .  .  .
         .  .  .  10 3  6  .  .  .     .  .  .  O  .  O  .  .  .
         .  .  .  .  8  .  .  .  .     .  .  .  .  O  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .`,
        0,
        2
    );

    example(
        'edge capture one',
        `3  .  .  6  1  2  .  .  .     X  .  .  O  .  O  .  .  .
         5  .  .  .  4  .  .  .  .     X  .  .  .  O  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .`,
        0,
        1
    );

    example(
        'corner capture one',
        `1  2  .  3  .  .  .  .  .     .  O  .  X  .  .  .  .  .
         4  .  .  .  .  .  .  .  .     O  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .`,
        0,
        1
    );

    example(
        'suicidal capture',
        `.  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  1  2  .  .  .  .     .  .  .  X  O  .  .  .  .
         .  .  3  4  9  8  .  .  .     .  .  X  .  X  O  .  .  .
         .  .  .  5  6  7  .  .  .     .  .  .  X  O  X  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .
         .  .  .  .  .  .  .  .  .     .  .  .  .  .  .  .  .  .`,
        1,
        0
    );
});
