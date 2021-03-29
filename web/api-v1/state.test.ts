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
const someMove = { board: someTileArray };
const someTableAttrs: S.TableAttrs = { manifold: 'normal/19x19' };
const someTable = { attrs: someTableAttrs, moves: [someMove] };

const someTileArrayEncoded = '.XO....OXOXOXOO...';
const someMoveEncoded = { b: someTileArrayEncoded };
const someTableEncoded = { a: someTableAttrs, m: [someMoveEncoded] };

describe(
    'tileArrayCodec',
    codecTests(S.tileArrayCodec, someTileArray, someTileArrayEncoded)
);
describe('moveCodec', codecTests(S.moveCodec, someMove, someMoveEncoded));
describe('tableCodec', codecTests(S.tableCodec, someTable, someTableEncoded));

describe(
    'tableTransitionCodec (reset)',
    codecTests(
        S.tableTransitionCodec,
        { t: 'reset', v: someTableAttrs },
        { t: 'r', v: someTableAttrs }
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
        const nextTable = apply({
            t: 'reset',
            v: { manifold: 'mobius/13x13' },
        });
        expect(nextTable).toStrictEqual({
            attrs: { manifold: 'mobius/13x13' },
            moves: [],
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
        const aMove = { board: [2, 1, 1, 2, 1] };
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
        new S.StateMachine(seq, { n }, (s, t) => ({ n: s.n + t.d }));

    it('applies empty batches correctly', () => {
        const m = newStateMachine(5);
        expect(m._state.n).toBe(5);
        m.applyBatch(seq + 1, []);
        expect(m._state.n).toBe(5);
        m.applyBatch(seq + 2, []);
        expect(m._state.n).toBe(5);
    });

    it('applies singleton batches correctly', () => {
        const m = newStateMachine(5);
        expect(m._state.n).toBe(5);
        m.applyBatch(seq + 1, [{ d: 5 }]);
        expect(m._state.n).toBe(10);
        m.applyBatch(seq + 2, [{ d: 4 }]);
        expect(m._state.n).toBe(14);
    });

    it('applies big batches correctly', () => {
        const m = newStateMachine(5);
        expect(m._state.n).toBe(5);
        m.applyBatch(seq + 1, [{ d: 5 }, { d: 4 }]);
        expect(m._state.n).toBe(14);
        m.applyBatch(seq + 2, [{ d: 3 }, { d: 2 }]);
        expect(m._state.n).toBe(19);
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
        const attrs: S.TableAttrs = { manifold: 'klein/19x19' };
        expect(convert({ t: 'reset', v: attrs })).toStrictEqual([
            { t: 'reset', v: { manifold: 'klein/19x19' } },
        ]);
    });

    it('converts undo correctly', () => {
        expect(convert({ t: 'undo' })).toStrictEqual([{ t: 'trunc', v: 0 }]);
    });

    // TODO: add a test for 'play'
});
