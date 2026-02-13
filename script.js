const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const success = document.getElementById("success");
const message = document.getElementById("message");
const heartsContainer = document.getElementById("hearts");
const tearsContainer = document.getElementById("tears");
const reaction = document.getElementById("reaction");
const face = document.getElementById("face");
const reactionText = document.getElementById("reactionText");
const jumpToProposal = document.getElementById("jumpToProposal");
const proposal = document.getElementById("proposal");
const progress = document.getElementById("progress");

const slidesTrack = document.getElementById("slidesTrack");
const prevSlide = document.getElementById("prevSlide");
const nextSlide = document.getElementById("nextSlide");
const dots = document.getElementById("dots");
const revealBlocks = document.querySelectorAll(".reveal");

const photoInput = document.getElementById("photoInput");
const applyPhotosBtn = document.getElementById("applyPhotosBtn");
const skipPhotosBtn = document.getElementById("skipPhotosBtn");
const uploadPreview = document.getElementById("uploadPreview");
const photoStatus = document.getElementById("photoStatus");
const generateLinkBtn = document.getElementById("generateLinkBtn");
const copyLinkBtn = document.getElementById("copyLinkBtn");
const shareBtn = document.getElementById("shareBtn");
const shareLink = document.getElementById("shareLink");

const defaultSlidesData = [
  {
    src: "valentine-moment.jpg",
    alt: "Romantic bridge moment",
    caption: "From shy looks to real love."
  },
  {
    src: "zootopia-2-123125-6cf558ba828d47388e367f62ce57aa1a.webp",
    alt: "Playful party moment",
    caption: "Laughing together is my favorite sound."
  },
  {
    src: "zootopia-2-sequel-movie.avif",
    alt: "Elegant evening moment",
    caption: "Dressed up, still looking at only you."
  }
];

const playfulReplies = [
  "Hmm... think again",
  "Are you very sure?",
  "Last chance to pick yes",
  "Plot twist: yes is better",
  "You and me? Perfect combo",
  "I am still waiting for yes",
  "My heart says you mean yes"
];

const noEmojis = ["&#128546;", "&#128557;", "&#128532;", "&#128577;", "&#128549;", "&#128542;"];
const yesEmojis = ["&#128522;", "&#128525;", "&#129392;", "&#128536;", "&#129321;", "&#128151;"];

let clickCount = 0;
const autoAcceptAfter = 8;
let currentSlide = 0;
let slides = [];
let uploadedPhotos = [];
let usingCustomPhotos = false;

function safeBase64Encode(input) {
  const bytes = new TextEncoder().encode(input);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function safeBase64Decode(input) {
  const base = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base.length % 4 === 0 ? "" : "=".repeat(4 - (base.length % 4));
  const binary = atob(base + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function launchHearts(total = 28) {
  for (let i = 0; i < total; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.innerHTML = Math.random() > 0.5 ? "&#10084;" : "&#9829;";
    heart.style.left = `${Math.random() * 100}vw`;
    heart.style.fontSize = `${Math.random() * 20 + 14}px`;
    heart.style.animationDuration = `${Math.random() * 2 + 3}s`;
    heart.style.animationDelay = `${Math.random() * 0.6}s`;
    heartsContainer.appendChild(heart);
    setTimeout(() => heart.remove(), 6500);
  }
}

function showHappyEnding(forced = false) {
  success.classList.remove("hidden");
  message.textContent = forced
    ? "I know your real answer is yes. I promise love, laughter, and endless date nights."
    : "Best answer ever. I promise love, laughter, and endless date nights.";
  yesBtn.textContent = "Forever yes";
  noBtn.classList.add("hidden");
  reaction.classList.remove("hidden");
  face.innerHTML = yesEmojis[(clickCount + (forced ? 1 : 0)) % yesEmojis.length];
  reactionText.textContent = "Happy face mode activated.";
  face.classList.remove("crying");
  void face.offsetWidth;
  face.classList.add("happy");
  launchHearts(90);
}

function cryAnimation() {
  reaction.classList.remove("hidden");
  face.innerHTML = noEmojis[(clickCount - 1) % noEmojis.length];
  reactionText.textContent = "You said no... now I am crying.";
  face.classList.remove("happy");
  void face.offsetWidth;
  face.classList.add("crying");

  for (let i = 0; i < 8; i += 1) {
    const tear = document.createElement("span");
    tear.className = "tear";
    tear.style.left = `${45 + Math.random() * 10}vw`;
    tear.style.animationDelay = `${i * 0.06}s`;
    tearsContainer.appendChild(tear);
    setTimeout(() => tear.remove(), 1200);
  }
}

function watchScrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
  progress.style.width = `${percent}%`;
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  revealBlocks.forEach((block) => observer.observe(block));
}

function renderDots() {
  dots.innerHTML = "";
  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "dot";
    dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
    if (index === currentSlide) {
      dot.classList.add("active");
    }
    dot.addEventListener("click", () => setSlide(index));
    dots.appendChild(dot);
  });
}

function setSlide(index) {
  if (!slides.length) {
    return;
  }
  currentSlide = (index + slides.length) % slides.length;
  slidesTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
  renderDots();
}

function buildSlides(data) {
  slidesTrack.innerHTML = "";
  data.forEach((item, index) => {
    const figure = document.createElement("figure");
    figure.className = "slide";

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || `Photo ${index + 1}`;

    const caption = document.createElement("figcaption");
    caption.textContent = item.caption || `Memory ${index + 1}`;

    figure.appendChild(img);
    figure.appendChild(caption);
    slidesTrack.appendChild(figure);
  });

  slides = Array.from(document.querySelectorAll(".slide"));
  setSlide(0);
}

function renderUploadPreview() {
  uploadPreview.innerHTML = "";
  if (!uploadedPhotos.length) {
    photoStatus.textContent = "No custom photos selected yet.";
    return;
  }

  photoStatus.textContent = `${uploadedPhotos.length} custom photo(s) ready.`;
  uploadedPhotos.forEach((photo, index) => {
    const fig = document.createElement("figure");
    fig.className = "upload-item";

    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = `Uploaded photo ${index + 1}`;

    const cap = document.createElement("figcaption");
    cap.textContent = photo.name || `Photo ${index + 1}`;

    fig.appendChild(img);
    fig.appendChild(cap);
    uploadPreview.appendChild(fig);
  });
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

async function fileToCompressedDataUrl(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const image = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const maxEdge = 900;
  const ratio = Math.min(maxEdge / image.width, maxEdge / image.height, 1);
  canvas.width = Math.round(image.width * ratio);
  canvas.height = Math.round(image.height * ratio);

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

async function handlePhotoInputChange() {
  const files = Array.from(photoInput.files || []).slice(0, 3);
  if (!files.length) {
    uploadedPhotos = [];
    renderUploadPreview();
    return;
  }

  photoStatus.textContent = "Processing photos...";
  const processed = [];
  for (let i = 0; i < files.length; i += 1) {
    const file = files[i];
    if (!file.type.startsWith("image/")) {
      continue;
    }
    const src = await fileToCompressedDataUrl(file);
    processed.push({ src, name: file.name });
  }

  uploadedPhotos = processed;
  renderUploadPreview();
}

function applyUploadedPhotos() {
  if (!uploadedPhotos.length) {
    photoStatus.textContent = "Upload photos first, or continue without photos.";
    return;
  }

  usingCustomPhotos = true;
  const customSlides = uploadedPhotos.map((photo, index) => ({
    src: photo.src,
    alt: `Custom memory ${index + 1}`,
    caption: `Our memory ${index + 1}`
  }));
  buildSlides(customSlides);
  photoStatus.textContent = "Using your uploaded photos in the slider.";
}

function useDefaultPhotos() {
  usingCustomPhotos = false;
  buildSlides(defaultSlidesData);
  photoStatus.textContent = "Continuing with default photos.";
}

function createSharePayload() {
  return {
    v: 1,
    useCustom: usingCustomPhotos,
    photos: uploadedPhotos.map((photo) => photo.src)
  };
}

function generateShareLink() {
  const payload = createSharePayload();
  const serialized = JSON.stringify(payload);
  const encoded = safeBase64Encode(serialized);
  const url = `${window.location.origin}${window.location.pathname}#share=${encoded}`;
  shareLink.value = url;

  if (url.length > 7000) {
    photoStatus.textContent = "Share link created, but it is very long. Use fewer/smaller photos if needed.";
  } else {
    photoStatus.textContent = "Share link generated.";
  }
}

async function copyShareLink() {
  if (!shareLink.value) {
    photoStatus.textContent = "Generate a share link first.";
    return;
  }
  await navigator.clipboard.writeText(shareLink.value);
  photoStatus.textContent = "Share link copied.";
}

async function shareUsingWebApi() {
  if (!shareLink.value) {
    photoStatus.textContent = "Generate a share link first.";
    return;
  }

  if (!navigator.share) {
    photoStatus.textContent = "Web Share is not supported on this browser. Use Copy link.";
    return;
  }

  await navigator.share({
    title: "Will you be my Valentine?",
    text: "I made this for you.",
    url: shareLink.value
  });
}

function loadSharedStateFromHash() {
  const rawHash = window.location.hash || "";
  if (!rawHash.startsWith("#share=")) {
    return;
  }

  try {
    const encoded = rawHash.slice(7);
    const decoded = safeBase64Decode(encoded);
    const payload = JSON.parse(decoded);

    if (!payload || payload.v !== 1) {
      return;
    }

    uploadedPhotos = Array.isArray(payload.photos)
      ? payload.photos
        .filter((photo) => typeof photo === "string" && photo.startsWith("data:image/"))
        .slice(0, 3)
        .map((src, index) => ({ src, name: `Shared photo ${index + 1}` }))
      : [];

    renderUploadPreview();

    if (payload.useCustom && uploadedPhotos.length) {
      applyUploadedPhotos();
      photoStatus.textContent = "Loaded photos from shared link.";
    } else {
      useDefaultPhotos();
      photoStatus.textContent = "Loaded shared link with default photos.";
    }
  } catch (_error) {
    photoStatus.textContent = "Could not read shared link data.";
  }
}

yesBtn.addEventListener("click", () => {
  showHappyEnding(false);
});

noBtn.addEventListener("click", () => {
  clickCount += 1;
  cryAnimation();

  // Grows the Yes button with each No click to keep the interaction playful.
  const scale = Math.min(1 + clickCount * 0.12, 1.9);
  yesBtn.style.transform = `scale(${scale})`;
  yesBtn.style.boxShadow = `0 14px 26px rgba(225, 29, 72, ${Math.min(0.3 + clickCount * 0.08, 0.7)})`;

  const label = playfulReplies[(clickCount - 1) % playfulReplies.length];
  noBtn.textContent = label;

  if (clickCount >= 5) {
    noBtn.style.opacity = "0.45";
  }

  if (clickCount >= autoAcceptAfter) {
    showHappyEnding(true);
  }
});

jumpToProposal.addEventListener("click", () => {
  proposal.scrollIntoView({ behavior: "smooth", block: "start" });
});

prevSlide.addEventListener("click", () => setSlide(currentSlide - 1));
nextSlide.addEventListener("click", () => setSlide(currentSlide + 1));

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    setSlide(currentSlide - 1);
  }
  if (event.key === "ArrowRight") {
    setSlide(currentSlide + 1);
  }
});

window.addEventListener("scroll", watchScrollProgress);
window.addEventListener("resize", watchScrollProgress);

photoInput.addEventListener("change", handlePhotoInputChange);
applyPhotosBtn.addEventListener("click", applyUploadedPhotos);
skipPhotosBtn.addEventListener("click", useDefaultPhotos);
generateLinkBtn.addEventListener("click", generateShareLink);
copyLinkBtn.addEventListener("click", () => {
  copyShareLink().catch(() => {
    photoStatus.textContent = "Copy failed. Please copy manually.";
  });
});
shareBtn.addEventListener("click", () => {
  shareUsingWebApi().catch(() => {
    photoStatus.textContent = "Sharing was cancelled or failed.";
  });
});

setupReveal();
buildSlides(defaultSlidesData);
watchScrollProgress();
loadSharedStateFromHash();

setInterval(() => {
  setSlide(currentSlide + 1);
}, 5000);
