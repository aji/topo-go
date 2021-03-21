(window as any).startGame = function (init: any, game: Element) {
    alert(JSON.stringify(init));
    console.log({ init, game });
};

console.log('hello, world');
