// Fetch the canvas element from the HTML
const canvas = document.getElementById("gameCanvas");
// Get the 2D rendering context for the canvas
const ctx = canvas.getContext("2d");
const currScore = document.querySelector(".currScore");
const highestScore = document.querySelector(".highestScore");
const rShot = document.querySelector("#rShot");
// Define the gun object and its properties
// let gun = {
//   x: canvas.width / 2 - 25, // Horizontal position (center of canvas, offset by half of the gun's width)
//   y: canvas.height - 100, // Vertical position (bottom of the canvas)
//   width: 50, // Width of the gun
//   height: 80, // Height of the gun
//   dx: 20, // Change in x-direction for movement
// };

const canvas_height = canvas.height;
const canvas_width = canvas.width;
const startButton = document.getElementById("startGameBtn");

// Define the target object and its properties
// let target = {
//   x: 100, // Initial horizontal position
//   y: 50, // Vertical position
//   radius: 20, // Radius of the target
//   dx: 6, // Change in x-direction for movement
// };

// Load the bullet sound effect
let bulletSound = new Audio("bulletFire.mp3");
let gameOverSound = new Audio("gameOver.wav");
// Game variables
let score = 0; // Player's current score
// Fetch high score from local storage or set it to 0 if not available

let spacePressed = false; // Track if the spacebar is pressed
let gameState = "notStarted"; // Current game state (notStarted, ongoing, ended)
let consecutiveMisses = 0; // Track consecutive missed shots

let monsterImg = new Image();
monsterImg.src = "monsterimage.png"; // path to your monster image

let bulletImg = new Image();
bulletImg.src = "bulletimage.png"; // path to your bullet image

let gunImg = new Image();
gunImg.src = "gunimage.png"; // path to your gun image

// --------------------------------------------------------------
let lhs = localStorage.getItem("lhs");

highestScore.textContent = lhs;
canvas.style.backgroundImage =
  "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)";
startButton.addEventListener("click", () => {
  highestScore.textContent = lhs;
  canvas.style.backgroundImage =
    "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)";
  let availableBullets = true;

  class targetClass {
    constructor(x, y, radius, dx, ctx) {
      this.x = x;
      this.y = y;
      this.radius = radius;
      this.dx = dx;
      this.ctx = ctx;
    }
    draw() {
      this.ctx.drawImage(
        monsterImg,
        this.x - this.radius,
        this.y - this.radius,
        this.radius * 2,
        this.radius * 2
      );
    }
    update() {
      this.x += this.dx;
      if (
        this.x - this.radius < 0 ||
        this.x + this.radius > this.ctx.canvas.width
      )
        this.dx *= -1;
    }
  }

  class bulletClass {
    constructor(x, y, width, hight, dy, bullets, ctx) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.hight = hight;
      this.dy = dy;
      this.ctx = ctx;
      this.bullets = bullets;
    }
    draw() {
      this.ctx.drawImage(bulletImg, this.x, this.y, this.width, this.hight);
    }
    update() {
      this.y -= this.dy;
    }
    updateBullets() {}
  }

  class gunClass {
    constructor(x, y, width, height, dx, speed, bullets, fire, ctx) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.dx = dx;
      this.speed = speed;
      this.ctx = ctx;
      this.fire = fire;
      this.bullets = bullets;
      window.addEventListener("keydown", this.handleKeyDown.bind(this));
      window.addEventListener("keyup", this.handleKeyUp.bind(this));
    }
    draw() {
      this.ctx.drawImage(gunImg, this.x, this.y, this.width, this.height);
    }
    update() {
      this.x += this.speed;
      if (this.x < 0) this.x = 0;
      if (this.x + this.width > canvas.width)
        this.x = canvas.width - this.width;
    }
    handleKeyDown(e) {
      if (e.key === "ArrowRight") this.speed = 5;
      if (e.key === "ArrowLeft") this.speed = -5;
      if (e.key === " ") this.playGunSound();
    }
    handleKeyUp(e) {
      if (e.key === "ArrowRight") this.speed = 0;
      if (e.key === "ArrowLeft") this.speed = 0;
    }
    playGunSound() {
      if (this.bullets.length < 5) {
        this.fire.currentTime = 0;
        this.fire.play();
      }
    }
  }
  // An array to store the bullets
  let bullets = [];
  const gun = new gunClass(
    canvas.width / 2 - 25,
    canvas.height - 100,
    50,
    80,
    20,
    0,
    bullets,
    bulletSound,
    ctx
  );
  const target = new targetClass(100, 50, 20, 4, ctx);

  window.addEventListener("keydown", (e) => {
    if (e.key === " " && bullets.length < 5) {
      const bullet = new bulletClass(
        gun.x + gun.width / 2 - 5,
        gun.y,
        10,
        20,
        5,
        bullets,
        ctx
      );

      bullets.push(bullet);
    }
  });

  const distance = function (bullet) {
    return Math.sqrt((bullet.x - target.x) ** 2 + (bullet.y - target.y) ** 2);
  };

  let s = 0;
  let hs = 0;

  highestScore.textContent = lhs;
  const updateBullets = function () {
    let bulletLength = bullets.length;
    let bulletOut = 0;
    for (let i = 0; i < bullets.length; i++) {
      bullets[i].update();
      const distances = distance(bullets[i]);
      if (bullets[i].y < 0) {
        bulletOut++;

        if (bulletLength === 5 && bulletOut === 5) {
          availableBullets = false;
        }
      }
      if (distances < bullets[i]?.width / 2 + target.radius) {
        s++;
        bullets.splice(0, bulletLength);
        bulletOut = 0;

        currScore.textContent = s;
        if (s > hs) {
          hs = s;
          localStorage.setItem("lhs", hs);
        }
        highestScore.textContent = lhs;
      }
    }
  };

  const bulletDraw = function () {
    for (let i = 0; i < bullets.length; i++) {
      bullets[i].draw();
    }
  };
  const gunMovement = function () {
    if (availableBullets) {
      requestAnimationFrame(gunMovement);
      gun.update();
      target.update();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateBullets();
      bulletDraw();
      gun.draw();
      target.draw();
    }
    if (availableBullets === false) {
      gameOverSound.currentTime = 0;
      gameOverSound.play();
      canvas.style.backgroundImage =
        "linear-gradient(120deg, red 100%, red 100%)";
    }
  };
  gunMovement();
});
