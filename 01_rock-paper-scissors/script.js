const computerChoiceDisplay = document.getElementById('computer-choice')
const UserChoiceDisplay = document.getElementById('user-choice');
const ResultDisplay = document.getElementById('result');
const possibleChoices = document.querySelectorAll(".chooice-btn");
const playerSocreDisplay = document.getElementById('player-score');
const computerScoreDisplay = document.getElementById('computer-score');
const resetBtn = document.getElementById('restart');


let gameOver = false;

let playerScore = 0;
let computerScore = 0;
let userChoice
let computerChioce
let result

resetBtn.addEventListener('click', resetGame);

possibleChoices.forEach(possibleChoices => possibleChoices.addEventListener('click', (e) => {
    e.preventDefault();
    if (gameOver) return;

    userChoice = e.target.id;
    UserChoiceDisplay.textContent = userChoice;
    generateComputerChoice();
    getResult();
}));

function generateComputerChoice() {
    const choice = ["rock", "paper", "scissors"];
    computerChioce = choice[Math.floor(Math.random() * choice.length)];
    computerChoiceDisplay.textContent = computerChioce;
}

function getResult() {
    const rules = {
        rock: "scissors",
        paper: "rock",
        scissors: "paper"
    }

    if (userChoice === computerChioce) {
        result = "It's a draw!"
    } else if (rules[userChoice] === computerChioce) {
        result = "You win!"
    } else {
        result = "Computer win!"
    }
    ResultDisplay.textContent = result;
    updateScore();

  
}

function updateScore() {
    if (result === 'You win!') {
        playerScore++;
    } else if (result === "Computer win!") {
        computerScore++;
    }
    playerSocreDisplay.textContent = playerScore;
    computerScoreDisplay.textContent = computerScore;

    if (playerScore === 3 || computerScore === 3) {
        endGame();
    }
}


function resetGame() {
    console.log('reset button..')
    playerScore = 0;
    computerScore = 0;

    gameOver = false;
    playerSocreDisplay.textContent = 0;
    computerScoreDisplay.textContent = 0;
    UserChoiceDisplay.textContent = '❔';
    computerChoiceDisplay.textContent = '❔';

    ResultDisplay.textContent = "Choose your move!"
}

function endGame() {
    gameOver = true;

    if (playerScore > computerScore) {
        ResultDisplay.textContent =
            "🏆 Game Over! You Win the Match!";
    }
    else if (computerScore > playerScore) {
        ResultDisplay.textContent =
            "💻 Game Over! Computer Wins!";
    }
    else {
        ResultDisplay.textContent =
            "🤝 Game Over! It's a Draw!";
    }
}