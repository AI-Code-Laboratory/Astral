/* Astral — suivi d'habitudes en constellation
   Tout est stocké en local (localStorage), rien ne quitte le navigateur. */

const STORAGE_KEY = "astral:habits";

const els = {
  form: document.getElementById("add-habit-form"),
  addBtn: document.getElementById("add-habit-btn"),
  cancelBtn: document.getElementById("cancel-add"),
  nameInput: document.getElementById("habit-name"),
  list: document.getElementById("habit-list"),
  emptyState: document.getElementById("empty-state"),
  svg: document.getElementById("constellation"),
  caption: document.getElementById("sky-caption"),
};

/* ---------- stockage ---------- */

function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}

function todayKey(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
}

/* ---------- logique métier ---------- */

let habits = loadHabits();

function addHabit(name) {
  habits.push({
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: Date.now(),
    completedDates: [],
  });
  saveHabits(habits);
  render();
}

function deleteHabit(id) {
  habits = habits.filter((h) => h.id !== id);
  saveHabits(habits);
  render();
}

function toggleToday(id) {
  const habit = habits.find((h) => h.id === id);
  if (!habit) return;
  const key = todayKey();
  const idx = habit.completedDates.indexOf(key);
  if (idx >= 0) {
    habit.completedDates.splice(idx, 1);
  } else {
    habit.completedDates.push(key);
  }
  saveHabits(habits);
  render();
}

function currentStreak(habit) {
  let streak = 0;
  let offset = habit.completedDates.includes(todayKey()) ? 0 : 1;
  while (habit.completedDates.includes(todayKey(offset))) {
    streak++;
    offset++;
  }
  return streak;
}

/* ---------- rendu: liste d'habitudes ---------- */

function renderList() {
  els.list.innerHTML = "";
  const hasHabits = habits.length > 0;
  els.emptyState.classList.toggle("hidden", hasHabits);
  els.list.classList.toggle("hidden", !hasHabits);

  habits.forEach((habit) => {
    const li = document.createElement("li");
    li.className = "habit-item";

    const doneToday = habit.completedDates.includes(todayKey());
    const streak = currentStreak(habit);

    li.innerHTML = `
      <button class="habit-star-btn ${doneToday ? "done" : ""}" aria-pressed="${doneToday}"
        aria-label="Marquer ${escapeHtml(habit.name)} comme faite aujourd'hui">
        ${doneToday ? "★" : "☆"}
      </button>
      <div class="habit-info">
        <p class="habit-name">${escapeHtml(habit.name)}</p>
        <p class="habit-meta"><span class="streak">${streak} jour${streak > 1 ? "s" : ""}</span> de suite</p>
      </div>
      <button class="habit-delete" aria-label="Supprimer ${escapeHtml(habit.name)}">✕</button>
    `;

    li.querySelector(".habit-star-btn").addEventListener("click", () => toggleToday(habit.id));
    li.querySelector(".habit-delete").addEventListener("click", () => deleteHabit(habit.id));

    els.list.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- rendu: ciel / constellation ---------- */

function seededPosition(id, index) {
  // hash déterministe pour que chaque étoile garde toujours la même place
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const rand = (n) => {
    const x = Math.sin(hash + n) * 10000;
    return x - Math.floor(x);
  };
  const x = 60 + rand(1) * 680;
  const y = 40 + rand(2) * 200 + (index % 3) * 8;
  return { x, y };
}

function renderSky() {
  const svg = els.svg;
  svg.innerHTML = "";
  const ns = "http://www.w3.org/2000/svg";

  if (habits.length === 0) {
    els.caption.textContent = "Ajoute une habitude pour commencer à écrire le ciel.";
    return;
  }

  const points = habits.map((h, i) => ({
    habit: h,
    pos: seededPosition(h.id, i),
    streak: currentStreak(h),
    doneToday: h.completedDates.includes(todayKey()),
  }));

  // lignes de constellation reliant les habitudes dans leur ordre de création
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i].pos;
    const b = points[i + 1].pos;
    const line = document.createElementNS(ns, "line");
    line.setAttribute("x1", a.x);
    line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x);
    line.setAttribute("y2", b.y);
    line.setAttribute("stroke", "rgba(140,122,230,0.35)");
    line.setAttribute("stroke-width", "1");
    svg.appendChild(line);
  }

  points.forEach(({ habit, pos, streak, doneToday }) => {
    const radius = 4 + Math.min(streak, 14) * 0.8;
    const color = doneToday ? "var(--gold)" : "var(--teal)";

    if (doneToday) {
      const glow = document.createElementNS(ns, "circle");
      glow.setAttribute("cx", pos.x);
      glow.setAttribute("cy", pos.y);
      glow.setAttribute("r", radius + 8);
      glow.setAttribute("fill", "var(--gold)");
      glow.setAttribute("opacity", "0.18");
      svg.appendChild(glow);
    }

    const star = document.createElementNS(ns, "circle");
    star.setAttribute("cx", pos.x);
    star.setAttribute("cy", pos.y);
    star.setAttribute("r", radius);
    star.setAttribute("fill", color);
    svg.appendChild(star);

    const label = document.createElementNS(ns, "text");
    label.setAttribute("x", pos.x);
    label.setAttribute("y", pos.y + radius + 16);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", "var(--muted)");
    label.setAttribute("font-size", "11");
    label.setAttribute("font-family", "var(--font-mono)");
    label.textContent = habit.name.length > 16 ? habit.name.slice(0, 15) + "…" : habit.name;
    svg.appendChild(label);
  });

  const longestStreak = Math.max(...points.map((p) => p.streak), 0);
  els.caption.textContent =
    longestStreak > 0
      ? `Plus longue série active : ${longestStreak} jour${longestStreak > 1 ? "s" : ""}.`
      : "Coche une habitude pour allumer ta première étoile du jour.";
}

function render() {
  renderList();
  renderSky();
}

/* ---------- formulaire ---------- */

els.addBtn.addEventListener("click", () => {
  els.form.classList.remove("hidden");
  els.nameInput.focus();
});

els.cancelBtn.addEventListener("click", () => {
  els.form.classList.add("hidden");
  els.form.reset();
});

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = els.nameInput.value.trim();
  if (!name) return;
  addHabit(name);
  els.form.reset();
  els.form.classList.add("hidden");
});

/* ---------- fond étoilé décoratif ---------- */

function initBackgroundStars() {
  const canvas = document.getElementById("bg-stars");
  const ctx = canvas.getContext("2d");
  let stars = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.floor((canvas.width * canvas.height) / 9000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.6,
    }));
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function draw(t) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((s) => {
      const twinkle = prefersReducedMotion ? 0.7 : 0.5 + 0.5 * Math.sin(t * 0.001 * s.speed + s.phase);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245,246,250,${0.15 + twinkle * 0.5})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(draw);
}

/* ---------- init ---------- */

initBackgroundStars();
render();
