// src/scripts/projects-page.ts

import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type CleanupFunction = () => void;

let cleanupProjectsPage:
  | CleanupFunction
  | undefined;

function initializeProjectsPage():
  | CleanupFunction
  | undefined {
  const page =
    document.querySelector<HTMLElement>(
      '.projects-page'
    );

  if (!page) {
    return;
  }

  const context = gsap.context(() => {
    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const revealElements = gsap.utils.toArray<HTMLElement>(
      '[data-projects-reveal]',
      page
    );

    const cards = gsap.utils.toArray<HTMLElement>(
      '[data-projects-card]',
      page
    );

    const links = gsap.utils.toArray<HTMLElement>(
      '[data-projects-link]',
      page
    );

    if (reducedMotion) {
      gsap.set(
        [
          ...revealElements,
          ...cards,
          ...links,
        ],
        {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          filter: 'none',
        }
      );

      return;
    }

    /*
     * Hero y encabezados.
     */
    revealElements.forEach((element) => {
      gsap.fromTo(
        element,
        {
          autoAlpha: 0,
          y: 45,
          filter: 'blur(8px)',
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',

          duration: 0.9,
          ease: 'power3.out',

          scrollTrigger: {
            trigger: element,
            start: 'top 88%',
            once: true,
          },
        }
      );
    });

    /*
     * Cards.
     */
    cards.forEach((card, index) => {
      gsap.fromTo(
        card,
        {
          autoAlpha: 0,
          y: 80,
          scale: 0.94,
          filter: 'blur(10px)',
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',

          duration: 0.95,
          delay: (index % 2) * 0.08,
          ease: 'power3.out',

          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true,
          },
        }
      );

      const image =
        card.querySelector<HTMLElement>(
          '.project-card-image'
        );

      if (image) {
        gsap.fromTo(
          image,
          {
            yPercent: -6,
          },
          {
            yPercent: 6,
            ease: 'none',

            scrollTrigger: {
              trigger: card,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
            },
          }
        );
      }
    });

    /*
     * Lista inferior.
     */
    links.forEach((link, index) => {
      gsap.fromTo(
        link,
        {
          autoAlpha: 0,
          y: 30,
        },
        {
          autoAlpha: 1,
          y: 0,

          duration: 0.65,
          delay: Math.min(index * 0.06, 0.3),
          ease: 'power2.out',

          scrollTrigger: {
            trigger: link,
            start: 'top 92%',
            once: true,
          },
        }
      );
    });
  }, page);

  const images = Array.from(
    page.querySelectorAll<HTMLImageElement>('img')
  );

  const refresh = (): void => {
    ScrollTrigger.refresh();
  };

  images.forEach((image) => {
    if (image.complete) {
      return;
    }

    image.addEventListener(
      'load',
      refresh,
      { once: true }
    );

    image.addEventListener(
      'error',
      refresh,
      { once: true }
    );
  });

  window.requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });

  return () => {
    images.forEach((image) => {
      image.removeEventListener(
        'load',
        refresh
      );

      image.removeEventListener(
        'error',
        refresh
      );
    });

    context.revert();
  };
}

function startProjectsPage(): void {
  cleanupProjectsPage?.();

  cleanupProjectsPage =
    initializeProjectsPage();
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    startProjectsPage,
    { once: true }
  );
} else {
  startProjectsPage();
}

document.addEventListener(
  'astro:page-load',
  startProjectsPage
);

document.addEventListener(
  'astro:before-swap',
  () => {
    cleanupProjectsPage?.();
    cleanupProjectsPage = undefined;
  }
);