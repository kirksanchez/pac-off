'use strict';

const playButton = document.getElementById('playButton');
const restartButton = document.getElementById('restartButton');
const quitButton = document.getElementById('quitButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const blogButton = document.getElementById('blogButton');
const audio = document.getElementById('gameAudio');

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

const scoreUpdate = document.querySelector('#scoreUpdate');

canvas.width = 600;
canvas.height = 500;

let paused = false;

class Border {
  static width = 40;
  static height = 40;
  constructor({ position, image }) {
    this.position = position;
    this.width = 40;
    this.height = 40;
    this.image = image;
  }

  show() {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

class pacMan {
  constructor({ position, velocity, image }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.rotation = 0;
    this.image = image;
  }
  show() {
    c.save();
    c.translate(this.position.x, this.position.y);
    c.rotate(this.rotation);
    c.translate(-this.position.x, -this.position.y);
    c.drawImage(
      this.image,
      this.position.x - this.radius,
      this.position.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );

    c.restore();
  }

  update() {
    this.show();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Enemy {
  static speed = 1;
  constructor({ position, velocity, image, scaredImage }) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 15;
    this.radians = 0.75;
    this.color = '#FFA400';
    this.prevCollisions = [];
    this.speed = 1;
    this.scared = false;
    this.image = image;
    this.scaredImage = scaredImage;
  }
  show() {
    c.beginPath();
    const image = this.scared ? this.scaredImage : this.image;
    c.drawImage(
      image,
      this.position.x - this.radius,
      this.position.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
    c.closePath();
  }

  update() {
    this.show();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Pellet {
  constructor({ position }) {
    this.position = position;
    this.radius = 3;
    this.htmlCode = '🥊';
  }

  show() {
    c.fillStyle = '#E54B4B';
    c.font = '14px sans-serif';
    c.fillText(this.htmlCode, this.position.x - 12, this.position.y + 5);
  }
}

class powerUp {
  constructor({ position, image }) {
    this.position = position;
    this.radius = 8;
    this.image = image;
  }

  show() {
    c.beginPath();
    c.drawImage(
      this.image,
      this.position.x - this.radius,
      this.position.y - this.radius,
      this.radius * 2,
      this.radius * 2
    );
    c.closePath();
  }
}

const foods = [];
const borders = [];
const powerUps = [];

const enemy1 = new Image();
enemy1.src = 'img/floyd-mayweather.png';

const enemy2 = new Image();
enemy2.src = 'img/miguel-cotto.png';

const enemy3 = new Image();
enemy3.src = 'img/manuel-marquez.png';

const enemy4 = new Image();
enemy4.src = 'img/ricky-hatton.png';

const scaredEnemyImage = new Image();
scaredEnemyImage.src = 'img/scared.png';

const powerUpImage = new Image();
powerUpImage.src = 'img/js.png';

const enemies = [
  new Enemy({
    position: {
      x: Border.width * 6 + Border.width / 2,
      y: Border.height + Border.height / 2,
    },
    velocity: {
      x: Enemy.speed,
      y: 0,
    },
    image: enemy1,
    scaredImage: scaredEnemyImage,
  }),
  new Enemy({
    position: {
      x: Border.width * 6 + Border.width / 2,
      y: Border.height * 3 + Border.height / 2,
    },
    velocity: {
      x: Enemy.speed,
      y: 0,
    },
    image: enemy2,
    scaredImage: scaredEnemyImage,
  }),
  new Enemy({
    position: {
      x: Border.width * 5 + Border.width / 2,
      y: Border.height * 8 + Border.height / 2,
    },
    velocity: {
      x: Enemy.speed,
      y: 0,
    },
    image: enemy3,
    scaredImage: scaredEnemyImage,
  }),
  new Enemy({
    position: {
      x: Border.width + Border.width / 2,
      y: Border.height * 7 + Border.height / 2,
    },
    velocity: {
      x: Enemy.speed,
      y: 0,
    },
    image: enemy4,
    scaredImage: scaredEnemyImage,
  }),
];

const pacmanImage = new Image();
pacmanImage.src = 'img/pacman.png';

const pacman = new pacMan({
  position: {
    x: Border.width + Border.width / 2,
    y: Border.height + Border.height / 2,
  },
  velocity: {
    x: 0,
    y: 0,
  },
  image: pacmanImage,
});

const keys = {
  w: {
    pressed: false,
  },
  a: {
    pressed: false,
  },
  s: {
    pressed: false,
  },
  d: {
    pressed: false,
  },
};

let lastKey = '';
let score = 0;

const map = [
  ['1', '-', '-', '-', '-', '-', '-', '-', '-', '-', '2'],
  ['|', ' ', '.', '.', '.', '.', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '7', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
  ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
  ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '+', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '_', '.', '.', '.', '.', '|'],
  ['|', '.', '[', ']', '.', '.', '.', '[', ']', '.', '|'],
  ['|', '.', '.', '.', '.', '^', '.', '.', '.', '.', '|'],
  ['|', '.', 'b', '.', '[', '5', ']', '.', 'b', '.', '|'],
  ['|', '.', '.', '.', '.', '.', '.', '.', '.', 'p', '|'],
  ['4', '-', '-', '-', '-', '-', '-', '-', '-', '-', '3'],
];

function createImage(src) {
  const image = new Image();
  image.src = src;
  return image;
}

map.forEach((row, i) => {
  row.forEach((symbol, j) => {
    switch (symbol) {
      case '-':
        borders.push(
          new Border({
            position: {
              x: Border.width * j,
              y: Border.height * i,
            },
            image: createImage('img/pipeHorizontal.png'),
          })
        );
        break;
      case '|':
        borders.push(
          new Border({
            position: {
              x: Border.width * j,
              y: Border.height * i,
            },
            image: createImage('img/pipeVertical.png'),
          })
        );
        break;
      case '1':
        borders.push(
          new Border({
            position: {
              x: Border.width * j,
              y: Border.height * i,
            },
            image: createImage('img/pipeCorner1.png'),
          })
        );
        break;
      case '2':
        borders.push(
          new Border({
            position: {
              x: Border.width * j,
              y: Border.height * i,
            },
            image: createImage('img/pipeCorner2.png'),
          })
        );
        break;
      case '3':
        borders.push(
          new Border({
            position: {
              x: Border.width * j,
              y: Border.height * i,
            },
            image: createImage('img/pipeCorner3.png'),
          })
        );
        break;
      case '4':
        borders.push(
          new Border({
            position: {
              x: Border.width * j,
              y: Border.height * i,
            },
            image: createImage('img/pipeCorner4.png'),
          })
        );
        break;
      case 'b':
        borders.push(
          new Border({
            position: {
              x: Border.width * j,
              y: Border.height * i,
            },
            image: createImage('img/block.png'),
          })
        );
        break;
      case '[':
        borders.push(
          new Border({
            position: {
              x: j * Border.width,
              y: i * Border.height,
            },
            image: createImage('img/capLeft.png'),
          })
        );
        break;
      case ']':
        borders.push(
          new Border({
            position: {
              x: j * Border.width,
              y: i * Border.height,
            },
            image: createImage('img/capRight.png'),
          })
        );
        break;
      case '_':
        borders.push(
          new Border({
            position: {
              x: j * Border.width,
              y: i * Border.height,
            },
            image: createImage('img/capBottom.png'),
          })
        );
        break;
      case '^':
        borders.push(
          new Border({
            position: {
              x: j * Border.width,
              y: i * Border.height,
            },
            image: createImage('img/capTop.png'),
          })
        );
        break;
      case '+':
        borders.push(
          new Border({
            position: {
              x: j * Border.width,
              y: i * Border.height,
            },
            image: createImage('img/pipeCross.png'),
          })
        );
        break;
      case '5':
        borders.push(
          new Border({
            position: {
              x: j * Border.width,
              y: i * Border.height,
            },
            color: 'blue',
            image: createImage('img/pipeConnectorTop.png'),
          })
        );
        break;
      case '6':
        borders.push(
          new Border({
            position: {
              x: j * Border.width,
              y: i * Border.height,
            },
            color: 'blue',
            image: createImage('img/pipeConnectorRight.png'),
          })
        );
        break;
      case '7':
        borders.push(
          new Border({
            position: {
              x: j * Border.width,
              y: i * Border.height,
            },
            color: 'blue',
            image: createImage('img/pipeConnectorBottom.png'),
          })
        );
        break;
      case '8':
        borders.push(
          new Border({
            position: {
              x: j * Border.width,
              y: i * Border.height,
            },
            image: createImage('img/pipeConnectorLeft.png'),
          })
        );
        break;
      case '.':
        foods.push(
          new Pellet({
            position: {
              x: j * Border.width + Border.width / 2,
              y: i * Border.height + Border.height / 2,
            },
          })
        );
        break;

      case 'p':
        powerUps.push(
          new powerUp({
            position: {
              x: j * Border.width + Border.width / 2,
              y: i * Border.height + Border.height / 2,
            },
            image: powerUpImage,
          })
        );
        break;
    }
  });
});

function collidesWithBorder({ circle, rectangle }) {
  const padding = Border.width / 2 - circle.radius - 1;
  return (
    circle.position.y - circle.radius + circle.velocity.y <=
      rectangle.position.y + rectangle.height + padding &&
    circle.position.x + circle.radius + circle.velocity.x >=
      rectangle.position.x - padding &&
    circle.position.y + circle.radius + circle.velocity.y >=
      rectangle.position.y - padding &&
    circle.position.x - circle.radius + circle.velocity.x <=
      rectangle.position.x + rectangle.width + padding
  );
}

let animationId;
function animate() {
  animationId = requestAnimationFrame(animate);
  c.clearRect(0, 0, canvas.width, canvas.height);

  if (keys.w.pressed && lastKey === 'w') {
    for (let i = 0; i < borders.length; i++) {
      const Border = borders[i];
      if (
        collidesWithBorder({
          circle: {
            ...pacman,
            velocity: {
              x: 0,
              y: -2,
            },
          },
          rectangle: Border,
        })
      ) {
        pacman.velocity.y = 0;
        break;
      } else {
        pacman.velocity.y = -2;
      }
    }
  } else if (keys.a.pressed && lastKey === 'a') {
    for (let i = 0; i < borders.length; i++) {
      const Border = borders[i];
      if (
        collidesWithBorder({
          circle: {
            ...pacman,
            velocity: {
              x: -2,
              y: 0,
            },
          },
          rectangle: Border,
        })
      ) {
        pacman.velocity.x = 0;
        break;
      } else {
        pacman.velocity.x = -2;
      }
    }
  } else if (keys.s.pressed && lastKey === 's') {
    for (let i = 0; i < borders.length; i++) {
      const Border = borders[i];
      if (
        collidesWithBorder({
          circle: {
            ...pacman,
            velocity: {
              x: 0,
              y: 2,
            },
          },
          rectangle: Border,
        })
      ) {
        pacman.velocity.y = 0;
        break;
      } else {
        pacman.velocity.y = 2;
      }
    }
  } else if (keys.d.pressed && lastKey === 'd') {
    for (let i = 0; i < borders.length; i++) {
      const Border = borders[i];
      if (
        collidesWithBorder({
          circle: {
            ...pacman,
            velocity: {
              x: 2,
              y: 0,
            },
          },
          rectangle: Border,
        })
      ) {
        pacman.velocity.x = 0;
        break;
      } else {
        pacman.velocity.x = 2;
      }
    }
  }
  for (let i = enemies.length - 1; 0 <= i; i--) {
    const enemy = enemies[i];
    if (
      Math.hypot(
        enemy.position.x - pacman.position.x,
        enemy.position.y - pacman.position.y
      ) <=
      enemy.radius + pacman.radius
    ) {
      if (enemy.scared) {
        enemies.splice(i, 1);
      } else {
        cancelAnimationFrame(animationId);
        alert('You lose');
        window.location.reload(true);
      }
    }
  }

  if (foods.length === 0) {
    alert('You won');
    cancelAnimationFrame(animationId);
    window.location.reload(true);
  }

  for (let i = powerUps.length - 1; 0 <= i; i--) {
    const powerUp = powerUps[i];
    powerUp.show();

    if (
      Math.hypot(
        powerUp.position.x - pacman.position.x,
        powerUp.position.y - pacman.position.y
      ) <
      powerUp.radius + pacman.radius
    ) {
      powerUps.splice(i, 1);

      enemies.forEach((enemy) => {
        enemy.scared = true;

        setTimeout(() => {
          enemy.scared = false;
        }, 5000);
      });
    }
  }

  for (let i = foods.length - 1; 0 <= i; i--) {
    const pellet = foods[i];
    pellet.show();

    if (
      Math.hypot(
        pellet.position.x - pacman.position.x,
        pellet.position.y - pacman.position.y
      ) <
      pellet.radius + pacman.radius
    ) {
      foods.splice(i, 1);
      score += 50;
      scoreUpdate.innerHTML = score;
    }
  }

  borders.forEach((Border) => {
    Border.show();

    if (
      collidesWithBorder({
        circle: pacman,
        rectangle: Border,
      })
    ) {
      pacman.velocity.x = 0;
      pacman.velocity.y = 0;
    }
  });
  pacman.update();

  enemies.forEach((enemy) => {
    enemy.update();

    const collisions = [];

    borders.forEach((Border) => {
      if (
        !collisions.includes('right') &&
        collidesWithBorder({
          circle: {
            ...enemy,
            velocity: {
              x: enemy.speed,
              y: 0,
            },
          },
          rectangle: Border,
        })
      ) {
        collisions.push('right');
      }

      if (
        !collisions.includes('left') &&
        collidesWithBorder({
          circle: {
            ...enemy,
            velocity: {
              x: -enemy.speed,
              y: 0,
            },
          },
          rectangle: Border,
        })
      ) {
        collisions.push('left');
      }

      if (
        !collisions.includes('up') &&
        collidesWithBorder({
          circle: {
            ...enemy,
            velocity: {
              x: 0,
              y: -enemy.speed,
            },
          },
          rectangle: Border,
        })
      ) {
        collisions.push('up');
      }

      if (
        !collisions.includes('down') &&
        collidesWithBorder({
          circle: {
            ...enemy,
            velocity: {
              x: 0,
              y: enemy.speed,
            },
          },
          rectangle: Border,
        })
      ) {
        collisions.push('down');
      }
    });
    if (collisions.length > enemy.prevCollisions.length)
      enemy.prevCollisions = collisions;

    if (JSON.stringify(collisions) !== JSON.stringify(enemy.prevCollisions)) {
      if (enemy.velocity.x > 0) enemy.prevCollisions.push('right');
      else if (enemy.velocity.x < 0) enemy.prevCollisions.push('left');
      else if (enemy.velocity.y < 0) enemy.prevCollisions.push('up');
      else if (enemy.velocity.y > 0) enemy.prevCollisions.push('down');

      const pathways = enemy.prevCollisions.filter((collision) => {
        return !collisions.includes(collision);
      });

      const direction = pathways[Math.floor(Math.random() * pathways.length)];

      switch (direction) {
        case 'down':
          enemy.velocity.y = enemy.speed;
          enemy.velocity.x = 0;
          break;

        case 'up':
          enemy.velocity.y = -enemy.speed;
          enemy.velocity.x = 0;
          break;

        case 'right':
          enemy.velocity.y = 0;
          enemy.velocity.x = enemy.speed;
          break;

        case 'left':
          enemy.velocity.y = 0;
          enemy.velocity.x = -enemy.speed;
          break;
      }
      enemy.prevCollisions = [];
    }
  });

  if (pacman.velocity.x > 0) pacman.rotation = Math.PI / 2; // right
  else if (pacman.velocity.x < 0) pacman.rotation = Math.PI * 3.5; // left
  else if (pacman.velocity.y > 0) pacman.rotation = Math.PI; // up
  else if (pacman.velocity.y < 0) pacman.rotation = Math.PI * 2; // down
}

addEventListener('keydown', ({ key }) => {
  switch (key) {
    case 'w':
      keys.w.pressed = true;
      lastKey = 'w';
      break;
    case 'a':
      keys.a.pressed = true;
      lastKey = 'a';
      break;
    case 's':
      keys.s.pressed = true;
      lastKey = 's';
      break;
    case 'd':
      keys.d.pressed = true;
      lastKey = 'd';
      break;
  }
});

addEventListener('keyup', ({ key }) => {
  switch (key) {
    case 'w':
      keys.w.pressed = false;
      break;
    case 'a':
      keys.a.pressed = false;
      break;
    case 's':
      keys.s.pressed = false;
      break;
    case 'd':
      keys.d.pressed = false;
      break;
  }
});

instructionsPanel.style.display = 'flex';
audio.style.display = 'none';

// Play the audio
function playAudio() {
  audio.play();
}

// Pause the audio
function pauseAudio() {}

// Change volume (0.0 to 1.0)
function setVolume(volume) {
  audio.volume = volume;
}

function enableLoop() {
  audio.loop = true;
}

playButton.addEventListener('click', () => {
  playButton.style.display = 'none';
  restartButton.style.display = 'inline-block';
  quitButton.style.display = 'inline-block';
  instructionsPanel.style.display = 'none';
  pauseButton.style.display = 'flex';
  blogButton.style.display = 'flex';
  audio.play();
  audio.loop = true;
  animate();
});

restartButton.addEventListener('click', () => {
  audio.pause();
  const confirmed = window.confirm('Are you sure you want to restart?');

  if (confirmed) {
    cancelAnimationFrame(animationId);
    window.location.reload(true);
  } else {
    audio.play();
    audio.loop = true;
  }
});

quitButton.addEventListener('click', () => {
  playButton.style.display = 'inline-block';
  restartButton.style.display = 'none';
  quitButton.style.display = 'none';
  instructionsPanel.style.display = 'none';
  audio.pause();
  const confirmed = window.confirm('Are you sure you want to quit?');
  if (confirmed) {
    cancelAnimationFrame(animationId);
    window.location.reload(true);
  } else {
    playButton.style.display = 'none';
    restartButton.style.display = 'inline-block';
    quitButton.style.display = 'inline-block';
    instructionsPanel.style.display = 'none';
    pauseButton.style.display = 'flex';
    resumeButton.style.display = 'none';
    blogButton.style.display = 'flex';
    audio.play();
    audio.loop = true;
    cancelAnimationFrame(animationId);
    animate();
  }
});

pauseButton.addEventListener('click', () => {
  paused = true;
  pauseButton.style.display = 'none';
  resumeButton.style.display = 'inline-block';
  audio.pause();
  cancelAnimationFrame(animationId);
});

resumeButton.addEventListener('click', () => {
  paused = false;
  resumeButton.style.display = 'none';
  pauseButton.style.display = 'inline-block';
  audio.play();
  audio.loop = true;
  animate();
});

blogButton.addEventListener('click', () => {
  paused = true;
  pauseButton.style.display = 'none';
  resumeButton.style.display = 'inline-block';
  cancelAnimationFrame(animationId);
  audio.pause();
});

canvas.addEventListener('touchstart', (event) => {
  event.preventDefault(); // Prevent default touch behavior
  const touchX = event.touches[0].clientX;
  const touchY = event.touches[0].clientY;

  // Determine the direction of touch based on touch coordinates
  if (touchX < canvas.width / 2) {
    // Left half of the screen, move left
    keys.a.pressed = true;
    keys.d.pressed = false;
  } else {
    // Right half of the screen, move right
    keys.d.pressed = true;
    keys.a.pressed = false;
  }

  if (touchY < canvas.height / 2) {
    // Top half of the screen, move up
    keys.w.pressed = true;
    keys.s.pressed = false;
  } else {
    // Bottom half of the screen, move down
    keys.s.pressed = true;
    keys.w.pressed = false;
  }
});

canvas.addEventListener('touchend', () => {
  // Reset all key presses when touch ends
  keys.w.pressed = false;
  keys.a.pressed = false;
  keys.s.pressed = false;
  keys.d.pressed = false;
});
