const introScreen = document.getElementById("introScreen");
const enterBtn = document.getElementById("enterBtn");
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const topBtn = document.getElementById("topBtn");
const ambientClip = document.getElementById("ambientClip");
const clipVideo = document.getElementById("clipVideo");
const previewButtons = document.querySelectorAll(".preview-btn");
const revealItems = document.querySelectorAll(".reveal");
const navLinks = document.querySelectorAll("nav a");

let tocando = false;
const previewAudio = new Audio();
let activePreviewButton = null;

function setMusicButton(isPlaying) {
  if (!musicBtn) return;

  musicBtn.textContent = isPlaying ? "Pausar música" : "Tocar música";
  musicBtn.setAttribute("aria-pressed", String(isPlaying));
}

function resetPreviewButton(button = activePreviewButton) {
  if (!button) return;

  button.classList.remove("playing", "loading", "unavailable");
  button.textContent = "Tocar 30s";
}

function pararPreview() {
  previewAudio.pause();
  previewAudio.currentTime = 0;
  resetPreviewButton();
  activePreviewButton = null;
}

async function tocarMusica() {
  if (!bgMusic) return;

  pararPreview();
  bgMusic.volume = 0.45;

  try {
    await bgMusic.play();
    tocando = true;
    setMusicButton(true);
  } catch (err) {
    tocando = false;
    setMusicButton(false);
  }
}

if (enterBtn && introScreen) {
  enterBtn.addEventListener("click", async () => {
    introScreen.classList.add("hide");

    if (ambientClip) {
      ambientClip.play().catch(() => {});
    }

    await tocarMusica();
  });
}

if (musicBtn) {
  musicBtn.addEventListener("click", async () => {
    if (!bgMusic) return;

    if (tocando) {
      bgMusic.pause();
      tocando = false;
      setMusicButton(false);
    } else {
      await tocarMusica();
    }
  });
}

async function buscarPrevia(track) {
  const params = new URLSearchParams({
    term: track,
    media: "music",
    entity: "song",
    country: "BR",
    limit: "10"
  });

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 6500);

  try {
    const response = await fetch(`https://itunes.apple.com/search?${params}`, {
      signal: controller.signal
    });
    const data = await response.json();
    const result = data.results.find((item) => item.previewUrl);

    return result?.previewUrl;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

previewAudio.addEventListener("timeupdate", () => {
  if (previewAudio.currentTime >= 30) {
    pararPreview();
  }
});

previewButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    const card = button.closest(".track-card");
    const track = card?.dataset.track;
    const localPreviewSrc = card?.dataset.previewSrc;

    if (!track || button.classList.contains("loading")) return;

    if (activePreviewButton === button && !previewAudio.paused) {
      pararPreview();
      return;
    }

    if (bgMusic && tocando) {
      bgMusic.pause();
      tocando = false;
      setMusicButton(false);
    }

    resetPreviewButton();
    activePreviewButton = button;
    button.classList.add("loading");
    button.textContent = "Buscando...";

    try {
      const previewUrl = localPreviewSrc || await buscarPrevia(track);

      if (!previewUrl) {
        button.classList.remove("loading");
        button.classList.add("unavailable");
        button.textContent = "Prévia indisponível";
        activePreviewButton = null;
        return;
      }

      previewAudio.src = previewUrl;
      previewAudio.currentTime = 0;
      await previewAudio.play();

      button.classList.remove("loading");
      button.classList.add("playing");
      button.textContent = "Pausar prévia";
    } catch (err) {
      button.classList.remove("loading");
      button.classList.add("unavailable");
      button.textContent = "Não tocou";
      activePreviewButton = null;
    }
  });
});

previewAudio.addEventListener("ended", () => {
  resetPreviewButton();
  activePreviewButton = null;
});

if (clipVideo) {
  clipVideo.addEventListener("loadedmetadata", () => {
    if (clipVideo.currentTime === 0) {
      clipVideo.currentTime = 0.2;
    }
  });

  clipVideo.muted = true;
  clipVideo.play().catch(() => {});
}

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18 })
  : null;

revealItems.forEach((item) => {
  if (revealObserver) {
    revealObserver.observe(item);
  } else {
    item.classList.add("visible");
  }
});

const sectionObserver = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  }, { rootMargin: "-38% 0px -55% 0px" })
  : null;

if (sectionObserver) {
  document.querySelectorAll("main section[id]").forEach((section) => {
    sectionObserver.observe(section);
  });
}

window.addEventListener("scroll", () => {
  topBtn?.classList.toggle("show", window.scrollY > 400);
});

topBtn?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
