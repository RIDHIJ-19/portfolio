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
    if (window.scrollY > 700) {
      isBackToTopRendered = true;
    } else {
      isBackToTopRendered = false;
    }
    alterStyles(isBackToTopRendered);
  });
}

/* -----------------------------------------
  Name Animation (Shuffle + Reveal Effect)
 ---------------------------------------- */

window.addEventListener("DOMContentLoaded", function () {
  const text = "Ridhi Jaggi";
  const animatedName = document.getElementById("animated-name");

  if (animatedName) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let displayText = Array(text.length).fill("");

    let shuffleInterval = setInterval(() => {
      animatedName.innerHTML = displayText.map((char, idx) =>
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

  /* -----------------------------------------
  GSAP Scroller Animation
 ---------------------------------------- */

  const scrollerAnimation = () => {
    if (typeof gsap !== "undefined" && gsap.timeline) {
      const tl2 = gsap.timeline({
        scrollTrigger: {
          trigger: "#services-section",
          scroller: "body",
          start: "top 70%",
          end: "bottom top",
          scrub: 2,
        },
      });

      tl2.from(".services", { y: 30, opacity: 0, duration: 0.5 });

      const animations = [
        [".elem.left.line1", { x: -300, opacity: 0, duration: 0.5 }, "line1animation"],
        [".elem.right.line1", { x: 300, opacity: 0, duration: 0.5 }, "line1animation"],
        [".elem.left.line2", { x: -300, opacity: 0, duration: 0.5 }, "line2animation"],
        [".elem.right.line2", { x: 300, opacity: 0, duration: 0.5 }, "line2animation"],
        [".contact-element h2", { y: 40, opacity: 0, duration: 0.2 }, "contact-anim"],
        [".contact-element p, .contact-element button", { y: 20, opacity: 0, duration: 0.5 }, "contact-anim"],
        [".contact-img img", { x: 100, opacity: 0, duration: 0.3 }, "contact-anim"],
        ["#caseStudy-section .services h3", { x: -300, opacity: 0, duration: 0.5 }],
        ["#caseStudy-section .services p", { x: 300, opacity: 0, duration: 0.5 }],
        [".caseBox-container .caseBox1", { y: 200, opacity: 0, duration: 0.2 }, "caseBoxAnim"],
        [".caseBox-container .caseBox2", { opacity: 0, duration: 0.5 }, "caseBoxAnim"],
        [".caseBox-container .caseBox3", { x: -200, opacity: 0, duration: 0.2 }, "caseBoxAnim"],
      ];

      animations.forEach(([selector, animationProps, label]) => {
        if (document.querySelector(selector)) {
          tl2.from(selector, animationProps, label);
        }
      });
    }
  };

  scrollerAnimation();
});

/* -----------------------------------------
  Cursor Animation
 ---------------------------------------- */

const main = document.querySelector("body");
const cursorAnim = document.querySelector(".cursor");

if (cursorAnim) {
  main.addEventListener("mousemove", (dets) => {
    gsap.to(".cursor", {
      x: dets.clientX,
      y: dets.clientY,
    });
  });
}

/* -----------------------------------------
  Home Animation
 ---------------------------------------- */

const homeAnimation = () => {
  if (typeof gsap !== "undefined" && gsap.timeline) {
    const tl = gsap.timeline();
    tl.from("nav .logo, nav h3", {
      y: -30,
      opacity: 0,
      duration: 0.3,
      delay: 0.5,
      stagger: 0.2,
    });
    tl.from(".center-part1 h1", { x: -300, opacity: 0, duration: 0.5 });
    tl.from(".center-part1 p", { y: -30, opacity: 0, duration: 0.3 });
    tl.from(".center-part1 button, nav button", { duration: 0.2, opacity: 0 });
    tl.from(".center-part2 img", { duration: 0.5, opacity: 0 }, "-=1");
    tl.from(".bottom-section img", { y: 30, opacity: 0, duration: 0.8, stagger: 0.2 }, "-=1");
  }
};

homeAnimation();
