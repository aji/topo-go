import { TableDetail } from '../api-v1/types';
import { Routes } from '../api-v1/routes';
import createClient from '../api-v1/client';

const { GET, POST, DELETE } = createClient(window.fetch);

(window as any).startGame = (init: TableDetail, game: Element): void => {
    const content = document.createElement('div');
    content.innerText = `Loading...`;
    GET(Routes.tables(init.id)).then((res) => {
        if (res.ok) {
            content.innerText = res.body.name;
        } else {
            content.innerText = 'oh no...';
        }
    });
    game.appendChild(content);
};
