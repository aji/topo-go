import * as S from './state';
import * as http from './http';
import { API } from './http';
import { logJitter } from './util';

export type ConnEvent = { conn: Connection };
export type ConnStartEvent = ConnEvent;
export type ConnChangeEvent = ConnEvent & {
    seqno: number;
    table: S.Table | undefined;
};

export type ConnHooks = {
    start: (e: ConnStartEvent) => void;
    change: (e: ConnChangeEvent) => void;
};

export class Connection {
    constructor(
        private call: http.ApiCaller,
        private init: http.Table,
        private hooks: ConnHooks,
        private sm: S.StateMachine<S.Table, S.TableTransition>
    ) {
        this.hooks.start({ conn: this });
        this.hooks.change({
            conn: this,
            seqno: this.sm.seqno,
            table: this.sm.state,
        });
        this._fetchTransitions();
    }

    static resume(
        call: http.ApiCaller,
        init: http.Table,
        hooks: Partial<ConnHooks>
    ): Connection {
        if (init.state === undefined || init.seqno === undefined) {
            throw new Error('resume() init missing fields');
        }

        return new Connection(
            call,
            init,
            {
                start: hooks.start || (() => {}),
                change: hooks.change || (() => {}),
            },
            new S.StateMachine(
                init.seqno,
                S.tableApply,
                S.tableCodec.decode(init.state)
            )
        );
    }

    _fetchTransitions() {
        this.call(
            API.table(this.init.id).transitions.get({ since: this.sm.seqno })
        ).then((res) => {
            if (res.ok) {
                this._transitions(res.body);
                this._fetchTransitions();
            } else {
                setTimeout(
                    () => this._fetchTransitions(),
                    logJitter(500, 2000)
                );
            }
        });
    }

    _transitions(res: http.Transitions) {
        res.trs.forEach((batch, i) => {
            this.sm.applyBatch(
                res.seqno + i,
                batch.map(S.tableTransitionCodec.decode)
            );
            this.hooks.change({
                conn: this,
                seqno: this.sm.seqno,
                table: this.sm.state,
            });
        });
    }
}
