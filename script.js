// The Day: scroll is the clock, 05:30 to 13:00. Without GSAP or with reduced
// motion the section stays a plain list, so nothing here is required.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("motion");

  const day = document.querySelector(".day");
  const stage = day.querySelector(".day-stage");
  const hours = [...day.querySelectorAll(".hour")];
  const digits = [...day.querySelectorAll(".day-clock span:not(.colon)")];
  const dishes = [...day.querySelectorAll(".board li")];
  const dot = day.querySelector(".rail i");
  const light = day.querySelector(".day-light");

  // where each hour sits on the track; the last 12% holds the closed café
  const END = 0.88;
  const pos = hours.map((_, i) => (i / (hours.length - 1)) * END);
  const mins = hours.map(h => +h.dataset.min);
  const FADE = 0.05;

  // the room's light at each hour: background, text, quiet text, accent
  const tones = [
    ["#151b26", "#efe8da", "#a7afbd", "#e8b453"],
    ["#1d2431", "#efe8da", "#aab1be", "#e8b453"],
    ["#2b2421", "#f1e8d8", "#c3b3a0", "#eab45a"],
    ["#4a2f1f", "#f6ecd9", "#dcc4a6", "#f0bd5e"],
    ["#ecdcb4", "#22160f", "#5b4634", "#94530f"],
    ["#f6f0e3", "#22160f", "#5b4a3b", "#94530f"],
    ["#dcd7cd", "#2a2622", "#57514a", "#5f5244"],
  ];
  const tone = t => ({ "--bg": t[0], "--fg": t[1], "--muted": t[2], "--acc": t[3] });

  const tl = gsap.timeline({ defaults: { ease: "none" } });
  gsap.set(day, tone(tones[0]));

  hours.forEach((h, i) => {
    if (!i) return;
    const prev = hours[i - 1];
    const at = pos[i] - FADE;
    tl.to(prev.querySelector(".hour-text"), { autoAlpha: 0, y: -16, duration: FADE * 0.6 }, at)
      .fromTo(h.querySelector(".hour-text"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: FADE * 0.6 }, at + FADE * 0.4)
      .to(prev.querySelector("figure"), { autoAlpha: 0, duration: FADE }, at)
      .fromTo(h.querySelector("figure"), { autoAlpha: 0, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: FADE }, at)
      .to(day, { ...tone(tones[i]), duration: FADE }, at);
  });

  // sun through the window: none before the buns, strongest mid-morning, gone by close
  tl.fromTo(light, { xPercent: -30, autoAlpha: 0 }, { xPercent: 20, autoAlpha: 0.75, duration: pos[4] - pos[3] }, pos[3])
    .to(light, { xPercent: 70, autoAlpha: 0, duration: pos[6] - pos[4] - FADE }, pos[4]);

  // the end: the light goes flat and the last photo cools
  tl.fromTo(hours.at(-1).querySelector("img"), { filter: "saturate(1) brightness(1)" }, { filter: "saturate(.72) brightness(1.06)", duration: 1 - END }, END);

  let last = -1;
  const clock = p => {
    let m = mins.at(-1);
    for (let i = 1; i < pos.length; i++) {
      if (p <= pos[i]) { m = mins[i - 1] + (mins[i] - mins[i - 1]) * ((p - pos[i - 1]) / (pos[i] - pos[i - 1])); break; }
    }
    m = Math.round(m / 5) * 5;
    if (m === last) return;
    last = m;
    const s = String(Math.floor(m / 60)).padStart(2, "0") + String(m % 60).padStart(2, "0");
    digits.forEach((d, i) => { if (d.textContent !== s[i]) d.textContent = s[i]; });
    dishes.forEach(li => {
      const state = m < +li.dataset.from ? "soon" : m < +li.dataset.to ? "on" : "gone";
      if (li.dataset.state !== state) li.dataset.state = state;
    });
  };

  ScrollTrigger.create({
    trigger: day,
    start: "top top",
    end: () => "+=" + innerHeight * 7,
    pin: stage,
    scrub: 0.6,
    animation: tl,
    invalidateOnRefresh: true,
  });
  // follow the smoothed timeline, not the raw scroll, so the clock lands with the photos
  const tick = () => {
    const p = tl.progress();
    clock(p);
    dot.style.left = `calc(${Math.min(p / END, 1) * 100}% - 3px)`;
  };
  tl.eventCallback("onUpdate", tick);
  tick();
})();

// Save a bun. A working form that sends nothing: it knows the café is closed on
// Mondays, that Saturday's tray is always spoken for, and how many buns are left
// on any other morning (made up, but the same date always gives the same answer).
(() => {
  const form = document.querySelector(".save-form");
  if (!form) return;
  const TRAY = 40, PRICE = 38;
  const day = form.querySelector("#f-day");
  const left = form.querySelector("#f-left");
  const name = form.querySelector("#f-name");
  const nameErr = form.querySelector("#f-name-err");
  const formErr = form.querySelector("#f-error");
  const total = form.querySelector(".total");
  const saved = document.querySelector("#f-saved");
  const kr = n => new Intl.NumberFormat("en-GB").format(n) + " kr.";
  const label = d => d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  const weekday = d => d.toLocaleDateString("en-GB", { weekday: "long" });

  const mornings = [];
  for (let d = new Date(), i = 0; mornings.length < 6 && i < 14; i++) {
    d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    if (d.getDay() !== 1) mornings.push(d);
  }
  const iso = d => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const leftOn = d => {
    if (d.getDay() === 6) return 0;
    let h = 7;
    for (const c of iso(d)) h = (h * 31 + c.charCodeAt(0)) % 9973;
    return 3 + (h % 26);
  };
  day.innerHTML = mornings.map((d, i) => `<option value="${i}">${i ? label(d) : "Tomorrow, " + weekday(d)}</option>`).join("");

  const qty = () => +form.querySelector('[name="qty"]:checked').value;
  const morning = () => mornings[+day.value];
  const update = () => {
    const n = leftOn(morning());
    left.textContent = n ? `${n} of ${TRAY} still free to save` : `${weekday(morning())}’s tray is already fully saved`;
    total.textContent = `${qty()} ${qty() === 1 ? "bun" : "buns"}, ${kr(qty() * PRICE)} at pickup`;
    day.removeAttribute("aria-invalid");
    formErr.textContent = "";
  };
  form.addEventListener("change", update);
  name.addEventListener("input", () => { name.removeAttribute("aria-invalid"); nameErr.textContent = ""; });
  update();

  form.addEventListener("submit", e => {
    e.preventDefault();
    const who = name.value.trim();
    const n = leftOn(morning());
    const q = qty();
    let ok = true;
    if (!who) {
      ok = false;
      name.setAttribute("aria-invalid", "true");
      nameErr.textContent = "Write a name for the bag, so we know whose buns they are.";
    }
    if (!n) {
      ok = false;
      day.setAttribute("aria-invalid", "true");
      formErr.textContent = `${weekday(morning())}’s tray is already fully saved. Pick another morning.`;
    } else if (q > n) {
      ok = false;
      day.setAttribute("aria-invalid", "true");
      formErr.textContent = `Only ${n} ${n === 1 ? "bun is" : "buns are"} left to save for ${weekday(morning())}. Pick ${n} or fewer, or another morning.`;
    }
    if (!ok) { (who ? day : name).focus(); return; }

    const time = form.querySelector("#f-time").value;
    saved.innerHTML = `<h3>Saved, ${who.replace(/[<>&"]/g, "")}.</h3>
      <p>${q} ${q === 1 ? "bun" : "buns"} in a paper bag with your name on it, ${label(morning())} at ${time}. Pay ${kr(q * PRICE)} when you pick them up. They wait for you until 08:00.</p>
      <p>Første Lys is a concept, so nothing was sent and no bun is waiting. If it were real, it would be.</p>
      <button type="button">Save for another morning</button>`;
    form.hidden = true;
    saved.hidden = false;
    saved.focus();
    saved.querySelector("button").addEventListener("click", () => {
      saved.hidden = true;
      form.hidden = false;
      form.reset();
      update();
      name.focus();
    });
  });
})();
