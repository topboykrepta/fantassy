const startPartyBtn = document.getElementById("startPartyBtn");
const loveBurstBtn = document.getElementById("loveBurstBtn");
const floatingHearts = document.getElementById("floatingHearts");
const yearLine = document.getElementById("yearLine");

const carouselTrack = document.getElementById("carouselTrack");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const dotsWrap = document.getElementById("dots");

const newLineBtn = document.getElementById("newLineBtn");
const noteBox = document.getElementById("noteBox");
const tagGrid = document.getElementById("tagGrid");
const hugCount = document.getElementById("hugCount");

const revealBlocks = document.querySelectorAll(".reveal");
const slides = Array.from(document.querySelectorAll(".slide"));

const sweetLines = [
  "You turn ordinary days into unforgettable stories.",
  "Your friendship is a safe place I am always thankful for.",
  "Every group chat is better because you are in it.",
  "You are proof that good hearts still exist.",
  "Thank you for standing beside me in every season.",
  "The world feels kinder when I think of our friendship.",
  "You are loved more than words can explain.",
  "Forever grateful that life introduced us."
];

let currentSlide = 0;
let hugs = 0;
let lineIndex = 0;

function launchHearts(total = 26) {
  for (let i = 0; i < total; i += 1) {
    const heart = document.createElement("span");
    heart.className = "float-heart";
    heart.innerHTML = Math.random() > 0.5 ? "&#10084;" : "&#9829;";
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.fontSize = `${Math.random() * 20 + 14}px`;
    heart.style.animationDuration = `${Math.random() * 2.2 + 3.2}s`;
    heart.style.color = Math.random() > 0.5 ? "#e11d48" : "#f43f5e";
    floatingHearts.appendChild(heart);

    setTimeout(() => heart.remove(), 6500);
  }
}

function typeLine(text) {
  noteBox.textContent = "";
  let i = 0;
  const timer = setInterval(() => {
    noteBox.textContent += text[i];
    i += 1;
    if (i >= text.length) {
      clearInterval(timer);
    }
  }, 22);
}

function renderDots() {
  dotsWrap.innerHTML = "";
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    if (index === currentSlide) {
      dot.classList.add("active");
    }
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    dot.addEventListener("click", () => setSlide(index));
    dotsWrap.appendChild(dot);
  });
}

function setSlide(index) {
  currentSlide = (index + slides.length) % slides.length;
  carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  renderDots();
}

function revealOnScroll() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.15 });

  revealBlocks.forEach((block) => observer.observe(block));
}

startPartyBtn.addEventListener("click", () => {
  launchHearts(45);
  document.querySelector(".page").scrollIntoView({ behavior: "smooth" });
});

loveBurstBtn.addEventListener("click", () => {
  launchHearts(60);
});

newLineBtn.addEventListener("click", () => {
  lineIndex = (lineIndex + 1) % sweetLines.length;
  typeLine(sweetLines[lineIndex]);
  launchHearts(16);
});

tagGrid.addEventListener("click", (event) => {
  const btn = event.target.closest(".friend-tag");
  if (!btn) {
    return;
  }

  btn.classList.toggle("active");
  hugs += 1;
  hugCount.textContent = String(hugs);
  launchHearts(10);
});

prevBtn.addEventListener("click", () => setSlide(currentSlide - 1));
nextBtn.addEventListener("click", () => setSlide(currentSlide + 1));

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    setSlide(currentSlide - 1);
  }
  if (event.key === "ArrowRight") {
    setSlide(currentSlide + 1);
  }
});

yearLine.textContent = `Made with friendship and gratitude - ${new Date().getFullYear()}`;
revealOnScroll();
setSlide(0);
setInterval(() => setSlide(currentSlide + 1), 5200);