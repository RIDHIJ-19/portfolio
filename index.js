/* -----------------------------------------
  Focus Outline for Keyboard Users Only
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if (e.key === "Tab") {
    document.body.classList.add("user-is-tabbing");

    window.removeEventListener("keydown", handleFirstTab);
    window.addEventListener("mousedown", handleMouseDownOnce);
  }
};

const handleMouseDownOnce = () => {
  document.body.classList.remove("user-is-tabbing");

  window.removeEventListener("mousedown", handleMouseDownOnce);
  window.addEventListener("keydown", handleFirstTab);
};

window.addEventListener("keydown", handleFirstTab);

/* -----------------------------------------
  Back to Top Button
 ---------------------------------------- */

const backToTopButton = document.querySelector(".back-to-top");
let isBackToTopRendered = false;

if (backToTopButton) {
  const alterStyles = (isBackToTopRendered) => {
    backToTopButton.style.visibility = isBackToTopRendered ? "visible" : "hidden";
    backToTopButton.style.opacity = isBackToTopRendered ? 1 : 0;
    backToTopButton.style.transform = isBackToTopRendered ? "scale(1)" : "scale(0)";
  };

  window.addEventListener("scroll", () => {
    isBackToTopRendered = window.scrollY > 700;
    alterStyles(isBackToTopRendered);
  });
}

/* -----------------------------------------
  Custom Cursor
 ---------------------------------------- */

const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");

if (!isCoarsePointer && cursorDot && cursorRing && typeof gsap !== "undefined") {
  const ringX = gsap.quickTo(cursorRing, "x", { duration: 0.5, ease: "power3.out" });
  const ringY = gsap.quickTo(cursorRing, "y", { duration: 0.5, ease: "power3.out" });
  const dotX = gsap.quickTo(cursorDot, "x", { duration: 0.12, ease: "power3.out" });
  const dotY = gsap.quickTo(cursorDot, "y", { duration: 0.12, ease: "power3.out" });

  window.addEventListener("mousemove", (e) => {
    ringX(e.clientX);
    ringY(e.clientY);
    dotX(e.clientX);
    dotY(e.clientY);
  });

  document.body.classList.add("has-custom-cursor");

  const hoverTargets = "a, button, .project-card, input, textarea";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverTargets)) cursorRing.classList.add("cursor-ring--active");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverTargets)) cursorRing.classList.remove("cursor-ring--active");
  });
}

/* -----------------------------------------
  Hero background: see hero-space.js (Three.js pink nebula +
  starfield rendered into #hero-canvas, layered over header.jpg)
 ---------------------------------------- */

/* -----------------------------------------
  Hero Constellation Particle Field
 ---------------------------------------- */

const constellationCanvas = document.getElementById("hero-constellation");

if (constellationCanvas) {
  const ctx = constellationCanvas.getContext("2d");
  let particles = [];
  let width, height;
  let rafId;

  const PARTICLE_COLOR = "255, 182, 213";
  const LINK_DISTANCE = 140;

  const resize = () => {
    const header = constellationCanvas.closest(".header");
    width = constellationCanvas.width = header.offsetWidth;
    height = constellationCanvas.height = header.offsetHeight;
    const count = Math.min(90, Math.floor((width * height) / 18000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.6,
    }));
  };

  const step = () => {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${PARTICLE_COLOR}, 0.7)`;
      ctx.fill();
    });

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DISTANCE) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${PARTICLE_COLOR}, ${0.15 * (1 - dist / LINK_DISTANCE)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    rafId = requestAnimationFrame(step);
  };

  resize();
  step();
  window.addEventListener("resize", resize);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      rafId = requestAnimationFrame(step);
    }
  });
}

/* -----------------------------------------
  Project Card Tilt
 ---------------------------------------- */

document.querySelectorAll("[data-tilt]").forEach((card) => {
  const MAX_TILT = 8;

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rotateY = (px - 0.5) * MAX_TILT * 2;
    const rotateX = (0.5 - py) * MAX_TILT * 2;

    card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
  });
});

/* -----------------------------------------
  Inline Project Demo Videos
 ---------------------------------------- */

document.querySelectorAll(".btn--video").forEach((button) => {
  button.addEventListener("click", () => {
    const container = button.closest(".project-card__inner").querySelector(".project-card__video");
    const isOpen = !container.hidden;

    if (isOpen) {
      container.hidden = true;
      container.innerHTML = "";
      button.innerHTML = "&#9654; Watch Demo";
    } else {
      const src = button.getAttribute("data-video");
      container.innerHTML = `<iframe src="${src}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe>`;
      container.hidden = false;
      button.innerHTML = "&#10005; Close Demo";
    }
  });
});

/* -----------------------------------------
  Name Animation (Shuffle + Reveal Effect) + Scroll Reveals
 ---------------------------------------- */

window.addEventListener("DOMContentLoaded", function () {
  const text = "Ridhi Jaggi";
  const animatedName = document.getElementById("animated-name");

  if (animatedName) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let displayText = Array(text.length).fill("");

    let shuffleInterval = setInterval(() => {
      animatedName.innerHTML = displayText.map((char) =>
        char || characters[Math.floor(Math.random() * characters.length)]
      ).join("");
    }, 50);

    let i = 0;
    function revealEffect() {
      if (i < text.length) {
        displayText[i] = text[i];
        i++;
        setTimeout(revealEffect, 200);
      } else {
        clearInterval(shuffleInterval);
      }
    }

    revealEffect();
  }

  if (typeof gsap !== "undefined" && gsap.registerPlugin) {
    gsap.registerPlugin(ScrollTrigger);

    const revealGroups = [
      { selector: ".reveal", vars: { y: 30, opacity: 0 } },
      { selector: ".reveal-left", vars: { x: -80, opacity: 0 } },
      { selector: ".reveal-right", vars: { x: 80, opacity: 0 } },
      { selector: ".reveal-up", vars: { y: 60, opacity: 0 } },
    ];

    revealGroups.forEach(({ selector, vars }) => {
      document.querySelectorAll(selector).forEach((el, i) => {
        const isProjectCard = el.matches(".project-grid .project-card");
        gsap.from(el, {
          ...vars,
          duration: isProjectCard ? 0.7 : 0.8,
          delay: isProjectCard ? (i % 3) * 0.1 : 0,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none reverse",
          },
        });
      });
    });
  }

  /* -----------------------------------------
    Hero Entrance Animation
   ---------------------------------------- */

  if (typeof gsap !== "undefined" && gsap.timeline) {
    const tl = gsap.timeline();
    tl.from(".nav__logo, .nav__item", { y: -20, opacity: 0, duration: 0.5, stagger: 0.1 });
    tl.from(".header__greeting", { y: 20, opacity: 0, duration: 0.4 }, "-=0.2");
    tl.from(".header__tagline", { y: 20, opacity: 0, duration: 0.5 }, "-=0.2");
    tl.from(".btn-cta", { y: 20, opacity: 0, duration: 0.5 }, "-=0.3");
  }
});
