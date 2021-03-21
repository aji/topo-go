import { TableDetail } from 'topo-go/web/api/types';

(window as any).startGame = function (init: TableDetail, game: Element) {
    const content = document.createElement('div');
    content.innerText = `Table`;
    game.appendChild(content);
};
