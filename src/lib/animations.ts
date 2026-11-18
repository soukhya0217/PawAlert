import anime from "animejs";

/**
 * 1. Staggered Bento Entrance Cascade
 * Animates cards, badges, and tiles cascading into view with spring physics
 */
export function animateBentoEntrance(selector: string | HTMLElement | HTMLElement[]): anime.AnimeInstance {
  return anime({
    targets: selector,
    translateY: [28, 0],
    scale: [0.96, 1],
    opacity: [0, 1],
    delay: anime.stagger(70, { start: 100 }),
    duration: 650,
    easing: "easeOutElastic(1, 0.75)",
  });
}

/**
 * 2. Rolling Number Counter for Real MongoDB Metrics
 * Animates numbers rolling up from current to target
 */
export function animateCounter(
  targetElement: HTMLElement | null,
  startVal: number,
  endVal: number,
  duration = 1200
): anime.AnimeInstance | null {
  if (!targetElement) return null;

  const obj = { val: startVal };
  return anime({
    targets: obj,
    val: endVal,
    round: 1,
    duration,
    easing: "easeOutExpo",
    update: () => {
      targetElement.textContent = String(Math.round(obj.val));
    },
  });
}

/**
 * 3. Interactive 3D Card Tilt on Pointer Move
 */
export function handleCardPointerMove(
  e: React.PointerEvent<HTMLElement>,
  maxTilt = 8
) {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const centerX = rect.width / 2;
  const centerY = rect.height / 2;

  const tiltX = ((y - centerY) / centerY) * -maxTilt;
  const tiltY = ((x - centerX) / centerX) * maxTilt;

  el.style.transform = `perspective(800px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-2px)`;
}

/**
 * Reset 3D Card Tilt with Spring Release
 */
export function handleCardPointerLeave(e: React.PointerEvent<HTMLElement>) {
  const el = e.currentTarget;
  anime({
    targets: el,
    rotateX: 0,
    rotateY: 0,
    translateY: 0,
    duration: 400,
    easing: "easeOutElastic(1, 0.6)",
    complete: () => {
      el.style.transform = "";
    },
  });
}

/**
 * 4. Squishy Toe Bean Pad Stretch & Squash
 */
export function animateToeBeanPress(element: HTMLElement) {
  anime.remove(element);
  return anime({
    targets: element,
    scaleX: [1, 1.25, 0.95, 1],
    scaleY: [1, 0.8, 1.1, 1],
    duration: 450,
    easing: "easeOutElastic(1.2, 0.5)",
  });
}

/**
 * 5. Mascot Ear Perk & Tail Wag
 */
export function animateMascotPerk(
  earLeft: HTMLElement | SVGElement | null,
  earRight: HTMLElement | SVGElement | null,
  tail: HTMLElement | SVGElement | null
) {
  if (earLeft && earRight) {
    anime({
      targets: [earLeft, earRight],
      rotate: (el: any) => (el === earLeft ? [-12, -2] : [12, 2]),
      transformOrigin: "50% 100%",
      duration: 350,
      easing: "easeOutElastic(1.5, 0.4)",
    });
  }

  if (tail) {
    anime({
      targets: tail,
      rotate: [-15, 20, -10, 15, 0],
      transformOrigin: "0% 100%",
      duration: 600,
      easing: "easeInOutSine",
    });
  }
}

/**
 * 6. Sequential Walking Paw Prints Stamping Down
 */
export function animatePawTrail(stepsSelector: string): anime.AnimeInstance {
  return anime({
    targets: stepsSelector,
    scale: [0, 1.2, 1],
    opacity: [0, 1],
    delay: anime.stagger(180),
    duration: 400,
    easing: "easeOutBack",
  });
}

/**
 * 7. Ink Stamp Slam ("SAFELY RESCUED!")
 */
export function animateRescueStamp(stampElement: HTMLElement | null): anime.AnimeInstance | null {
  if (!stampElement) return null;
  return anime({
    targets: stampElement,
    scale: [3, 0.95, 1],
    rotate: [-15, -4],
    opacity: [0, 1],
    duration: 500,
    easing: "easeOutBounce",
  });
}
