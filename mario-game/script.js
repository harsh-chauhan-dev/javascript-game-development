
// Game Constant
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 2.5;
const ENEMY_SPEED = 1;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;

// Game State
let gameState = {
    score: 0,
    level: 1,
    lives: 3,
    gameRunning: true,
    keys: {},
};

let player = {
    element: document.getElementById('mario'),
    x: 50,
    y: 340,
    width: 20,
    height: 20,
    velocityX: 0,
    velocityY: 0,
    grounded: false,
    big: false,
    bigTimer: 0,
    enteringPipe: false,
    pipeEntryTimer: 0,
};

// Game Object
let gameObjects = {
    platforms: [],
    enemies: [],
    coins: [],
    surpriseBlocks: [],
    pipes: []
};

let levels = [
    {
        platforms: [
            { x: 0, y: 360, width: 400, height: 40, type: 'ground' },
            { x: 500, y: 360, width: 300, height: 40, type: 'ground' },
            { x: 200, y: 280, width: 60, height: 20, type: 'floating' },
            { x: 300, y: 240, width: 60, height: 20, type: 'floating' },
            { x: 600, y: 280, width: 80, height: 20, type: 'floating' },
        ],
        enemies: [
            { x: 250, y: 344, type: 'brown' },
            { x: 550, y: 344, type: 'brown' },
        ],
        coins: [
            { x: 220, y: 260 },
            { x: 320, y: 220 },
            { x: 620, y: 260 },
        ],
        surpriseBlocks: [
            { x: 350, y: 220, type: 'mushroom' }
        ],
        pipes: [
            { x: 750, y: 320 },
        ]
    },
    {
        platforms: [
            { x: 0, y: 360, width: 200, height: 40, type: 'blue' },
            { x: 300, y: 360, width: 200, height: 40, type: 'blue' },
            { x: 600, y: 360, width: 200, height: 20, type: 'blue' },
            { x: 150, y: 300, width: 40, height: 20, type: 'blue' },
            { x: 250, y: 280, width: 40, height: 20, type: 'blue' },
            { x: 350, y: 260, width: 40, height: 20, type: 'blue' },
            { x: 550, y: 280, width: 40, height: 20, type: 'blue' },
        ],
        enemies: [
            { x: 360, y: 344, type: 'purple' },
            { x: 650, y: 344, type: 'purple' },
            { x: 570, y: 264, type: 'purple' },
        ],
        coins: [
            { x: 170, y: 280 },
            { x: 270, y: 260 },
            { x: 370, y: 240 },
            { x: 470, y: 220 },
            { x: 570, y: 260 },
        ],
        surpriseBlocks: [
            { x: 260, y: 220, type: 'coin' },
            { x: 400, y: 220, type: 'mushroom' }
        ],
        pipes: [
            { x: 750, y: 320 },
        ]
    }
];

// Initialising Function
function initGame() {
    bindEvents();
    loadLevel(gameState.level - 1);
    gameLoop();
}

function bindEvents() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.getElementById('reset-button').addEventListener('click', resetGame);
}

function handleKeyDown(e) {
    gameState.keys[e.code] = true;

    if (e.code === 'Space' || e.code.startsWith('Arrow')) {
        e.preventDefault();
    }
}

function handleKeyUp(e) {
    gameState.keys[e.code] = false;
}

function resetGame() {
    gameState.score = 0;
    gameState.level = 1;
    gameState.lives = 3;
    gameState.gameRunning = true;
    gameState.keys = {};
    document.getElementById('game-over').style.display = 'none';
    loadLevel(0);
    gameLoop();
}

function loadLevel(levelIndex) {
    if (levelIndex >= levels.length) {
        showGameOver(true);
        return;
    }

    clearLevel();

    const level = levels[levelIndex];
    const gameArea = document.getElementById('game-area');

    // Reset the player
    player.x = 50;
    player.y = 340;
    player.velocityX = 0;
    player.velocityY = 0;
    player.grounded = false;
    player.big = false;
    player.bigTimer = 0;
    player.width = 20;
    player.height = 20;
    player.enteringPipe = false;
    player.pipeEntryTimer = 0;
    player.element.className = '';
    player.element.style.opacity = '1';
    player.element.style.transform = 'scale(1)';
    updateElemnetPosition(player.element, player.x, player.y);

    // Create platforms
    level.platforms.forEach((platformData, index) => {
        const platform = createElements('div', `platform ${platformData.type}`, {
            left: platformData.x + 'px',
            top: platformData.y + 'px',
            width: platformData.width + 'px',
            height: platformData.height + 'px'
        });
        gameArea.appendChild(platform);
        gameObjects.platforms.push({
            element: platform,
            ...platformData,
            id: 'platform-' + index
        });
    });

    // Create enemies
    level.enemies.forEach((enemyData, index) => {
        const enemy = createElements('div', `enemy ${enemyData.type}`, {
            left: enemyData.x + 'px',
            top: enemyData.y + 'px'
        });
        gameArea.appendChild(enemy);
        gameObjects.enemies.push({
            element: enemy,
            x: enemyData.x,
            y: enemyData.y,
            width: 20,
            height: 20,
            direction: -1,
            speed: ENEMY_SPEED,
            id: 'enemy-' + index,
            alive: true
        });
    });

    // Create coins
    level.coins.forEach((coinData, index) => {
        const coin = createElements('div', `coin`, {
            left: coinData.x + 'px',
            top: coinData.y + 'px',
        });
        gameArea.appendChild(coin);
        gameObjects.coins.push({
            element: coin,
            x: coinData.x,
            y: coinData.y,
            width: 20,
            height: 20,
            collected: false,
            id: 'coin-' + index,
        });
    });

    // Create surprise blocks
    level.surpriseBlocks.forEach((blockData, index) => {
        const surprise = createElements('div', 'surprise-block', {
            left: blockData.x + 'px',
            top: blockData.y + 'px',
        });
        gameArea.appendChild(surprise);
        gameObjects.surpriseBlocks.push({
            element: surprise,
            x: blockData.x,
            y: blockData.y,
            width: 20,
            height: 20,
            type: blockData.type,
            hit: false,
            id: 'block-' + index,
        });
    });

    // Create pipes
    level.pipes.forEach((pipeData, index) => {
        const pipe = createElements('div', 'pipe', {
            left: pipeData.x + 'px',
            top: pipeData.y + 'px',
        });
        const pipeLeft = createElements('div', 'pipe-top');
        const pipeTopRight = createElements('div', 'pipe-top-right');
        const pipeBottom = createElements('div', 'pipe-bottom');
        const pipeBottomRight = createElements('div', 'pipe-bottom-right');

        pipe.append(pipeLeft, pipeTopRight, pipeBottom, pipeBottomRight);
        gameArea.appendChild(pipe);
        gameObjects.pipes.push({
            element: pipe,
            x: pipeData.x,
            y: pipeData.y,
            width: 40,
            height: 40,
            id: 'pipe-' + index
        });
    });

    updateHud();
}

function updateHud() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('lives').textContent = gameState.lives;
}

function updateElemnetPosition(element, x, y) {
    element.style.left = x + 'px';
    element.style.top = y + 'px';
}

function createElements(type, className, styles = {}) {
    const element = document.createElement(type);
    element.className = className;
    Object.assign(element.style, styles);
    return element;
}

function showGameOver(won) {
    gameState.gameRunning = false;
    document.getElementById('game-over-title').textContent = won ? 'Congratulations You Won!' : 'Game Over';
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('game-over').style.display = 'block';
}

function clearLevel() {
    Object.values(gameObjects).flat().forEach(obj => {
        if (obj.element && obj.element.parentNode) {
            obj.element.remove();
        }
    });
    gameObjects = {
        platforms: [],
        enemies: [],
        coins: [],
        surpriseBlocks: [],
        pipes: []
    };
}

function loseLife() {
    gameState.lives = Math.max(0, gameState.lives - 1);
    if (gameState.lives <= 0) {
        showGameOver(false);
    } else {
        loadLevel(gameState.level - 1);
    }
}

function getPipeUnderPlayer() {

    for (const pipe of gameObjects.pipes) {

        if (
            checkCollision(player, pipe) &&
            player.y + player.height <= pipe.y + 2
        ) {
            return pipe;
        }
    }

    return null;
}

function enterPipe() {

    player.enteringPipe = true;
    player.pipeEntryTimer = 0;

    player.velocityX = 0;
    player.velocityY = 0;

    player.grounded = true;
}

// Game Loop
function gameLoop() {
    if (!gameState.gameRunning) return;
    update();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (player.enteringPipe) {
        player.pipeEntryTimer += 1;
        player.y += 6;
        player.element.style.opacity = Math.max(0.2, 1 - player.pipeEntryTimer / 20);
        player.element.style.transform = `scale(${Math.max(0.3, 1 - player.pipeEntryTimer / 30)})`;

        if (player.pipeEntryTimer >= 18) {
            player.enteringPipe = false;
            player.pipeEntryTimer = 0;
            if (gameState.level >= levels.length) {
                showGameOver(true);
            } else {
                gameState.level += 1;
                loadLevel(gameState.level - 1);
            }
            return;
        }

        updateElemnetPosition(player.element, player.x, player.y);
        return;
    }

    if (gameState.keys['ArrowLeft'] || gameState.keys['KeyA']) {
        player.velocityX = -MOVE_SPEED;
    } else if (gameState.keys['ArrowRight'] || gameState.keys['KeyD']) {
        player.velocityX = MOVE_SPEED;
    } else {
        player.velocityX *= 0.8;
    }

    if ((gameState.keys['Space'] || gameState.keys['ArrowUp'] || gameState.keys['KeyW']) && player.grounded) {
        player.velocityY = JUMP_FORCE;
        player.grounded = false;
    }

    if (!player.grounded) {
        player.velocityY += GRAVITY;
    }

   for (const pipe of gameObjects.pipes) {
    if (!checkCollision(player, pipe)) continue;

    if (player.velocityY >= 0 &&
        player.y + player.height - player.velocityY <= pipe.y + 1) {

        player.y = pipe.y - player.height;
        player.velocityY = 0;
        player.grounded = true;

    } else if (player.x + player.width <= pipe.x + 5) {

        player.x = pipe.x - player.width;

    } else if (player.x >= pipe.x + pipe.width - 5) {

        player.x = pipe.x + pipe.width;
    }
    }
 // Enter pipe
if (
    player.grounded &&
    (gameState.keys["ArrowDown"] || gameState.keys["KeyS"])
) {
    const pipe = getPipeUnderPlayer();

    if (pipe) {
        console.log("ENTER");

        enterPipe(pipe);
        return;
    }
}

    // Update player position
    player.x += player.velocityX;
    player.y += player.velocityY;

    player.x = Math.max(0, Math.min(GAME_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(GAME_HEIGHT - player.height, player.y));

    player.grounded = false;

    for (const platform of gameObjects.platforms) {
        if (checkCollision(player, platform)) {
            if (player.velocityY >= 0 && player.y + player.height - player.velocityY <= platform.y + 1) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
            }
        }
    }

    for (const block of gameObjects.surpriseBlocks) {
        if (checkCollision(player, block)) {
            if (player.velocityY >= 0 && player.y + player.height - player.velocityY <= block.y + 1) {
                player.y = block.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
            } else if (player.velocityY < 0 && !block.hit) {
                block.hit = true;
                block.element.classList.add('hit');

                if (block.type === 'mushroom') {
                    player.big = true;
                    player.bigTimer = 600;
                    player.element.classList.add('big');
                    player.width = 30;
                    player.height = 30;
                    gameState.score += 100;
                } else if (block.type === 'coin') {
                    gameState.score += 50;
                }
            }
        }
    }

    for (const pipe of gameObjects.pipes) {
        if (!checkCollision(player, pipe)) continue;

        if (player.velocityY >= 0 && player.y + player.height - player.velocityY <= pipe.y + 1) {
            player.y = pipe.y - player.height;
            player.velocityY = 0;
            player.grounded = true;
        } else if (player.x + player.width <= pipe.x + 5) {
            player.x = pipe.x - player.width;
        } else if (player.x >= pipe.x + pipe.width - 5) {
            player.x = pipe.x + pipe.width;
        }
    }

    for (let enemy of gameObjects.enemies) {
        if (!enemy.alive) continue;
        enemy.x += enemy.speed * enemy.direction;

        let onPlatform = false;
        for (let platform of gameObjects.platforms) {
            if (
                enemy.x + enemy.width > platform.x &&
                enemy.x < platform.x + platform.width &&
                enemy.y + enemy.height >= platform.y - 5 &&
                enemy.y + enemy.height <= platform.y + 5
            ) {
                onPlatform = true;
                break;
            }
        }

        if (!onPlatform || enemy.x < 0 || enemy.x >= GAME_WIDTH) {
            enemy.direction *= -1;
        }
        updateElemnetPosition(enemy.element, enemy.x, enemy.y);

        if (checkCollision(player, enemy)) {
            if (player.velocityY > 0 && player.y + player.height - enemy.y < 12) {
                enemy.alive = false;
                enemy.element.remove();
                player.velocityY = JUMP_FORCE * 0.7;
                gameState.score += 100;
            } else {
                if (player.big) {
                    player.big = false;
                    player.bigTimer = 0;
                    player.element.classList.remove('big');
                    player.width = 20;
                    player.height = 20;
                } else {
                    loseLife();
                    return;
                }
            }
        }
    }

    for (let coin of gameObjects.coins) {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            coin.element.remove();
            gameState.score += 50;
        }
    }

    // Fell into a gap
    if (!player.grounded && player.y >= GAME_HEIGHT - player.height) {
        loseLife();
        return;
    }

    updateHud();
    updateElemnetPosition(player.element, player.x, player.y);
}


function checkCollision(e1, e2) {
    return e1.x < e2.x + e2.width &&
        e1.x + e1.width > e2.x &&
        e1.y < e2.y + e2.height &&
        e1.y + e1.height > e2.y;
}

initGame();