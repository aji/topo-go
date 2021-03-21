import { Game, Manifold, Board, XY } from '../../game/board';

export type TableID = string;
export type TableList = Map<TableID, Table>;

export interface Player {
    token: string;
    name: string;
}

export class Table {
    id: TableID;
    name: string;

    players: Array<Player> = [];
    game: null | Game<XY>;

    constructor(id: TableID, name: string) {
        this.id = id;
        this.name = name;
        this.game = null;
    }

    static named(name: string) {
        const id =
            't-' +
            name
                .split(' ')
                .map((s) => s.toLowerCase())
                .join('-');
        return new Table(id, name);
    }
}

export function tableListFromNames(names: Array<string>): TableList {
    const tables = new Map();

    for (const name of names) {
        const table = Table.named(name);
        tables.set(table.id, table);
    }

    return tables;
}

export const newDefaultTableList = () =>
    tableListFromNames([
        'Sun',
        'Moon',
        'Earth',
        'Mercury',
        'Venus',
        'Mars',
        'Jupiter',
        'Saturn',
        'Uranus',
        'Neptune',
        'Pluto',
    ]);
