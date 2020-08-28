function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function botPlayRandom() {
    let num = 0;
    while (isGameOver == false) {
        if (promotePos != null) {
            let choice = ['Q', 'H', 'R', 'B'];
            let choose = choice[Math.floor(Math.random() * choice.length)];
            promote(choose);
            continue;
        }

        let allPossiblePiece = [];

        for (let i = 0; i <= 7; i++) {
            for (let j = 0; j <= 7; j++) {
                if (currentTable[i][j] != '' && currentTable[i][j][1] == turn) {
                    clickOn(i + '_' + j);

                    if (allPossibleMove.length > 0) {
                        allPossiblePiece.push(i + '_' + j);
                    }

                    clickOn(i + '_' + j);
                }
            }
        }

        let movePiece = allPossiblePiece[Math.floor(Math.random() * allPossiblePiece.length)];

        clickOn(movePiece);

        await sleep(500);

        let moveSpot = allPossibleMove[Math.floor(Math.random() * allPossibleMove.length)];

        clickOn(moveSpot);

        await sleep(500);
    }
}

function wait() {
    return new Promise((resolve) => {
        setTimeout(() => resolve('this was wait'), 5000);
    }).then((result) => console.log(result));
}

async function test() {
    await wait();

    return new Promise((resolve, reject) => {
        setTimeout(() => resolve('function test complete'), 5000);
    }).then((result) => console.log(result));
}

function test2() {
    console.log('this is test 2');
}

function test() {
    (async () => {
        await (() =>
            new Promise((resolve) =>
                setTimeout(() => resolve('make it way'), 3000)
            ))().then((result) => console.log(result));
    })();
    console.log('test2');
}

test();
