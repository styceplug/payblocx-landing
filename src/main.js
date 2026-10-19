import { links } from "./config.js";

// Wire external links from config (store badges, socials, legal, support).
for (const el of document.querySelectorAll("[data-link]")) {
  const url = links[el.dataset.link];
  if (url) {
    el.setAttribute("href", url);
    if (/^https?:/.test(url)) {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    }
  } else if (el.closest("[data-socials]") || el.hasAttribute("data-optional")) {
    el.hidden = true; // hide social icons that have no account yet
  }
}

// Footer year.
const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

// Sticky nav: shadow on scroll + mobile menu.
const nav = document.querySelector("[data-nav]");
const toggle = document.querySelector("[data-nav-toggle]");
const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const setMenu = (open) => {
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
};
toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
for (const a of nav.querySelectorAll(".nav__links a")) a.addEventListener("click", () => setMenu(false));
document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Currency roll: duplicate items so the marquee loops seamlessly.
const track = document.querySelector("[data-marquee]");
if (track) {
  for (const li of [...track.children]) {
    const copy = li.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    track.appendChild(copy);
  }
}

// "VS" pain lists: move the highlighted pill through the list.
if (!reduceMotion) {
  for (const list of document.querySelectorAll("[data-cycle]")) {
    const items = [...list.children];
    let i = items.findIndex((li) => li.classList.contains("is-active"));
    setInterval(() => {
      items[i].classList.remove("is-active");
      i = (i + 1) % items.length;
      // keep the highlight inside the visible middle band
      if (i < 2 || i > items.length - 3) i = 2;
      items[i].classList.add("is-active");
    }, 2400);
  }
}

// Security carousel.
const carousel = document.querySelector("[data-carousel]");
if (carousel) {
  const slides = [...carousel.querySelectorAll(".carousel__slide")];
  let index = 0;
  let timer;
  const show = (next) => {
    slides[index].classList.remove("is-active");
    index = (next + slides.length) % slides.length;
    slides[index].classList.add("is-active");
  };
  const restart = () => {
    clearInterval(timer);
    if (!reduceMotion) timer = setInterval(() => show(index + 1), 6000);
  };
  carousel.querySelector("[data-prev]").addEventListener("click", () => { show(index - 1); restart(); });
  carousel.querySelector("[data-next]").addEventListener("click", () => { show(index + 1); restart(); });
  restart();
}

// FAQ: keep one answer open at a time.
const accordion = document.querySelector("[data-accordion]");
if (accordion) {
  const items = [...accordion.querySelectorAll("details")];
  for (const d of items) {
    d.addEventListener("toggle", () => {
      if (d.open) for (const other of items) if (other !== d) other.open = false;
    });
  }
}

// Waitlist: hero (phone) and final CTA (email) forms.
// Posts to links.waitlistEndpoint when set, otherwise opens a pre-filled email to support.
const NATIONAL_DIGITS = { NG: 10, GH: 9 }; // without the leading 0

for (const form of document.querySelectorAll("[data-waitlist]")) {
  const channel = form.dataset.waitlist;
  const note = form.parentElement.querySelector("[data-form-note]");
  const country = form.querySelector("[data-country]");
  const flag = form.querySelector("[data-country-flag]");

  country?.addEventListener("change", () => {
    flag.className = `flag flag--${country.value.toLowerCase()}`;
  });

  const say = (text, isError = false) => {
    note.textContent = text;
    note.classList.toggle("is-error", isError);
    note.hidden = false;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const payload = { channel, source: "landing" };

    if (channel === "phone") {
      const option = country.selectedOptions[0];
      const digits = form.phone.value.replace(/\D/g, "").replace(/^0/, "");
      if (digits.length !== NATIONAL_DIGITS[country.value]) {
        say(`Enter a valid ${country.value === "NG" ? "Nigerian" : "Ghanaian"} phone number.`, true);
        form.phone.focus();
        return;
      }
      payload.country = country.value;
      payload.phone = `${option.dataset.dial}${digits}`;
    } else {
      if (!form.email.checkValidity()) {
        say("Enter a valid email address.", true);
        form.email.focus();
        return;
      }
      payload.email = form.email.value.trim();
    }

    if (!links.waitlistEndpoint) {
      const contact = payload.phone || payload.email;
      window.location.href = `${links.supportEmail}?subject=${encodeURIComponent("PayBlocx waitlist")}&body=${encodeURIComponent(`Please add me to the PayBlocx waitlist: ${contact}`)}`;
      return;
    }

    const button = form.querySelector("button");
    button.disabled = true;
    try {
      const res = await fetch(links.waitlistEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(String(res.status));
      say("You're on the list. We'll be in touch when PayBlocx is ready.");
      form.reset();
      if (flag) flag.className = "flag flag--ng";
    } catch {
      say("Something went wrong. Please try again.", true);
    } finally {
      button.disabled = false;
    }
  });
}

// Newsletter: posts to links.newsletterEndpoint when set, otherwise opens an email to support.
const form = document.querySelector("[data-newsletter]");
if (form) {
  const note = form.querySelector("[data-newsletter-note]");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.email.value.trim();
    if (!links.newsletterEndpoint) {
      window.location.href = `${links.supportEmail}?subject=${encodeURIComponent("Newsletter sign-up")}&body=${encodeURIComponent(`Please add ${email} to the PayBlocx newsletter.`)}`;
      return;
    }
    const button = form.querySelector("button");
    button.disabled = true;
    try {
      const res = await fetch(links.newsletterEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(String(res.status));
      note.textContent = "Thanks! You're on the list.";
      form.reset();
    } catch {
      note.textContent = "Something went wrong. Please try again.";
    } finally {
      note.hidden = false;
      button.disabled = false;
    }
  });
}

// Contact form: posts to links.contactEndpoint when set, otherwise opens a pre-filled email to support.
const contactForm = document.querySelector("[data-contact]");
if (contactForm) {
  const note = contactForm.querySelector("[data-contact-note]");
  const say = (text, isError = false) => {
    note.textContent = text;
    note.classList.toggle("is-error", isError);
    note.hidden = false;
  };
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let firstInvalid = null;
    for (const input of contactForm.querySelectorAll("input, textarea, select")) {
      const ok = input.checkValidity() && (!input.required || input.value.trim() !== "");
      input.closest(".field")?.classList.toggle("is-invalid", !ok);
      if (!ok && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) {
      say("Please fill in your name, a valid email and a message of at least 10 characters.", true);
      firstInvalid.focus();
      return;
    }
    const data = Object.fromEntries(
      [...new FormData(contactForm)].map(([k, v]) => [k, String(v).trim()]),
    );

    if (!links.contactEndpoint) {
      const body = `${data.message}\n\nName: ${data.name}\nEmail: ${data.email}${data.phone ? `\nPhone: ${data.phone}` : ""}`;
      window.location.href = `${links.supportEmail}?subject=${encodeURIComponent(`${data.topic}: ${data.name}`)}&body=${encodeURIComponent(body)}`;
      say("Your email app should open with your message ready to send.");
      return;
    }

    const button = contactForm.querySelector("button");
    button.disabled = true;
    try {
      const res = await fetch(links.contactEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "website" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      say("Thanks, your message has been sent. We'll reply by email.");
      contactForm.reset();
    } catch {
      say("Something went wrong. Please try again or email support@payblocx.com.", true);
    } finally {
      button.disabled = false;
    }
  });
}

// Delete-account request (/delete-account/, not linked from the site).
const deleteForm = document.querySelector("[data-delete-account]");
if (deleteForm) {
  const note = deleteForm.querySelector("[data-delete-note]");
  const say = (text, isError = false) => {
    note.textContent = text;
    note.classList.toggle("is-error", isError);
    note.hidden = false;
  };
  deleteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let firstInvalid = null;
    for (const input of deleteForm.querySelectorAll("input, textarea")) {
      const ok = input.checkValidity() && (!input.required || input.type === "checkbox" || input.value.trim() !== "");
      input.closest(".field, .check")?.classList.toggle("is-invalid", !ok);
      if (!ok && !firstInvalid) firstInvalid = input;
    }
    if (firstInvalid) {
      say("Please enter your name and account email, and tick the confirmation box.", true);
      firstInvalid.focus();
      return;
    }
    const data = Object.fromEntries(
      [...new FormData(deleteForm)].filter(([k]) => k !== "confirm").map(([k, v]) => [k, String(v).trim()]),
    );

    if (!links.deleteAccountEndpoint) {
      const details = [
        `Name: ${data.name}`,
        `Account email: ${data.email}`,
        data.phone && `Account phone: ${data.phone}`,
        data.tag && `PayBlocx tag: ${data.tag}`,
        data.reason && `Reason: ${data.reason}`,
      ].filter(Boolean);
      const body = ["Please delete my PayBlocx account.", "", ...details].join("\n");
      window.location.href = `${links.supportEmail}?subject=${encodeURIComponent("Account deletion request")}&body=${encodeURIComponent(body)}`;
      say("Your email app should open with the request ready to send. Send it from your account email so we can verify it's you.");
      return;
    }

    const button = deleteForm.querySelector("button");
    button.disabled = true;
    try {
      const res = await fetch(links.deleteAccountEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source: "website" }),
      });
      if (!res.ok) throw new Error(String(res.status));
      say("Request received. We'll email you to confirm before your account is closed.");
      deleteForm.reset();
    } catch {
      say("Something went wrong. Please try again or email support@payblocx.com.", true);
    } finally {
      button.disabled = false;
    }
  });
}

// Reveal sections on scroll.
if (!reduceMotion && "IntersectionObserver" in window) {
  const targets = document.querySelectorAll(".section-head, .versus, .cta-band, .carousel, .accordion, .final-cta");
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  for (const t of targets) {
    t.classList.add("reveal");
    io.observe(t);
  }
}
