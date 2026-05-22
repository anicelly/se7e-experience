const introScreen = document.getElementById("introScreen");
const enterBtn = document.getElementById("enterBtn");
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const playerBtn = document.getElementById("playerBtn");
const progressBar = document.getElementById("progressBar");
const topBtn = document.getElementById("topBtn");
const albumCard = document.getElementById("albumCard");

let tocando = false;

function tocarMusica() {
  bgMusic.volume = 0.5;

  bgMusic.play()
    .then(() => {
      tocando = true;
      musicBtn.textContent = "Pausar música";
      playerBtn.textContent = "⏸";
    })
    .catch((erro) => {
      console.log("Erro ao tocar:", erro);
      musicBtn.textContent = "Tocar música";
      playerBtn.textContent = "▶";
    });
}

function pausarMusica() {
  bgMusic.pause();
  tocando = false;
  musicBtn.textContent = "Tocar música";
  playerBtn.textContent = "▶";
}

enterBtn.addEventListener("click", () => {
  introScreen.classList.add("hide");
  tocarMusica();
});

musicBtn.addEventListener("click", () => {
  tocando ? pausarMusica() : tocarMusica();
});

playerBtn.addEventListener("click", () => {
  tocando ? pausarMusica() : tocarMusica();
});

bgMusic.addEventListener("timeupdate", () => {
  if (bgMusic.duration) {
    const progresso = (bgMusic.currentTime / bgMusic.duration) * 100;
    progressBar.style.width = `${progresso}%`;
  }
});

/* REVEAL */

const revealElements = document.querySelectorAll(
  ".section, .track-card, .show-card, .artist-frame"
);

revealElements.forEach((el) => {
  el.classList.add("reveal");
});

function revealOnScroll() {
  revealElements.forEach((el) => {
    const position = el.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;

    if (position < screenHeight - 90) {
      el.classList.add("active");
    }
  });

  if (window.scrollY > 400) {
    topBtn.classList.add("show");
  } else {
    topBtn.classList.remove("show");
  }
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

topBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

/* PARALLAX CAPA */

document.addEventListener("mousemove", (event) => {
  const x = (event.clientX / window.innerWidth - 0.5) * 20;
  const y = (event.clientY / window.innerHeight - 0.5) * 20;

  albumCard.style.transform = `translate(${x}px, ${y}px)`;
});

/* PARTÍCULAS */

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

let particles = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

function createParticles() {
  particles = [];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 1,
      speedX: Math.random() * 0.6 - 0.3,
      speedY: Math.random() * 0.6 - 0.3
    });
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(142,203,255,0.55)";
    ctx.fill();

    p.x += p.speedX;
    p.y += p.speedY;

    if (p.x < 0 || p.x > canvas.width) {
      p.speedX *= -1;
    }

    if (p.y < 0 || p.y > canvas.height) {
      p.speedY *= -1;
    }
  });

  requestAnimationFrame(animateParticles);
}

createParticles();
animateParticles();