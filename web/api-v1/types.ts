export interface ErrorBody {
    message: string;
}

export interface TableSearchOptions {}

export interface TableSummary {
    id: string;
    name: string;
}

export interface TableDetail extends TableSummary {
    players: Array<PlayerSummary>;
}

export interface PlayerSummary {
    name: string;
}
