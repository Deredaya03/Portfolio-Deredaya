import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type CleanupFunction = () => void;

type ProjectDOM = {
  section: HTMLElement;
  sticky: HTMLElement;
  stage: HTMLElement | null;

  slides: HTMLElement[];
  dots: HTMLElement[];

  progressContainer: HTMLElement | null;
  progressFill: HTMLElement | null;

  counter: HTMLElement | null;
  aboutPanel: HTMLElement | null;
  projectHeader: HTMLElement | null;
  dotsContainer: HTMLElement | null;
  scrollIndicator: HTMLElement | null;
};

let cleanupCurrentAnimation:
  | CleanupFunction
  | undefined;

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.min(
    Math.max(value, minimum),
    maximum
  );
}

function getProjectDOM(): ProjectDOM | null {
  const section =
    document.querySelector<HTMLElement>(
      '[data-project-section]'
    );

  if (!section) {
    return null;
  }

  const sticky =
    section.querySelector<HTMLElement>(
      '[data-project-sticky]'
    );

  const slides = Array.from(
    section.querySelectorAll<HTMLElement>(
      '[data-project-slide]'
    )
  );

  if (!sticky || slides.length === 0) {
    return null;
  }

  return {
    section,
    sticky,

    stage:
      section.querySelector<HTMLElement>(
        '[data-project-stage]'
      ),

    slides,

    dots: Array.from(
      section.querySelectorAll<HTMLElement>(
        '[data-project-dot]'
      )
    ),

    progressContainer:
      section.querySelector<HTMLElement>(
        '[data-project-progress-container]'
      ),

    progressFill:
      section.querySelector<HTMLElement>(
        '[data-project-progress]'
      ),

    counter:
      section.querySelector<HTMLElement>(
        '[data-project-current]'
      ),

    aboutPanel:
      section.querySelector<HTMLElement>(
        '[data-about-panel]'
      ),

    projectHeader:
      section.querySelector<HTMLElement>(
        '[data-project-header]'
      ),

    dotsContainer:
      section.querySelector<HTMLElement>(
        '[data-project-dots]'
      ),

    scrollIndicator:
      section.querySelector<HTMLElement>(
        '[data-scroll-indicator]'
      ),
  };
}

/*
 * 0 = pantalla vacía
 * 1 = primer proyecto
 * 2 = segundo proyecto
 */
function updateActiveState(
  dom: ProjectDOM,
  stateIndex: number
): void {
  const {
    slides,
    dots,
    counter,
  } = dom;

  const safeState = clamp(
    stateIndex,
    0,
    slides.length
  );

  const activeProjectIndex =
    safeState - 1;

  if (counter) {
    counter.textContent = String(
      safeState
    ).padStart(2, '0');
  }

  slides.forEach((slide, index) => {
    const isActive =
      index === activeProjectIndex;

    slide.setAttribute(
      'aria-hidden',
      isActive ? 'false' : 'true'
    );

    slide.style.pointerEvents =
      isActive ? 'auto' : 'none';

    if ('inert' in slide) {
      slide.inert = !isActive;
    }
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle(
      'is-active',
      index === activeProjectIndex
    );
  });
}

function getActiveState(
  progress: number,
  projectCount: number
): number {
  return Math.round(
    progress * projectCount
  );
}

function setInitialStates(
  dom: ProjectDOM
): void {
  const {
    slides,
    progressContainer,
    progressFill,
    aboutPanel,
    projectHeader,
    dotsContainer,
    scrollIndicator,
  } = dom;

  gsap.set(slides, {
    autoAlpha: 0,

    xPercent: 12,
    yPercent: 45,

    scale: 0.92,
    rotateX: -5,

    filter: 'blur(12px)',

    transformPerspective: 1400,
    transformOrigin: 'center center',

    pointerEvents: 'none',
  });

  if (aboutPanel) {
    gsap.set(aboutPanel, {
      autoAlpha: 0,
      xPercent: -16,
      filter: 'blur(10px)',
    });
  }

  if (projectHeader) {
    gsap.set(projectHeader, {
      autoAlpha: 0,
      yPercent: -25,
      filter: 'blur(8px)',
    });
  }

  if (dotsContainer) {
    gsap.set(dotsContainer, {
      autoAlpha: 0,
      y: 10,
    });
  }

  if (progressContainer) {
    gsap.set(progressContainer, {
      autoAlpha: 0,
    });
  }

  if (progressFill) {
    gsap.set(progressFill, {
      scaleY: 0,
      transformOrigin: 'top center',
    });
  }

  if (scrollIndicator) {
    /*
     * El centrado ya lo hace CSS.
     * No aplicamos xPercent ni yPercent aquí.
     */
    gsap.set(scrollIndicator, {
      autoAlpha: 1,
      scale: 1,
      filter: 'blur(0px)',
    });
  }

  updateActiveState(dom, 0);
}

function addInitialReveal(
  timeline: gsap.core.Timeline,
  dom: ProjectDOM,
  mobile: boolean
): void {
  const {
    slides,
    aboutPanel,
    projectHeader,
    dotsContainer,
    progressContainer,
    scrollIndicator,
  } = dom;

  const firstSlide = slides[0];

  if (scrollIndicator) {
    timeline.to(
      scrollIndicator,
      {
        autoAlpha: 0,
        scale: 0.88,
        filter: 'blur(8px)',

        duration: 0.3,
        ease: 'power1.in',
      },
      0.05
    );
  }

  if (aboutPanel) {
    timeline.to(
      aboutPanel,
      {
        autoAlpha: 1,
        xPercent: 0,
        filter: 'blur(0px)',

        duration: 0.58,
        ease: 'power2.out',
      },
      0.22
    );
  }

  if (projectHeader) {
    timeline.to(
      projectHeader,
      {
        autoAlpha: 1,
        yPercent: 0,
        filter: 'blur(0px)',

        duration: 0.5,
        ease: 'power2.out',
      },
      0.22
    );
  }

  timeline.to(
    firstSlide,
    {
      autoAlpha: 1,

      xPercent: 0,
      yPercent: 0,

      scale: 1,
      rotateX: 0,

      filter: 'blur(0px)',

      duration: mobile
        ? 0.56
        : 0.65,

      ease: 'power2.out',
    },
    0.28
  );

  if (dotsContainer) {
    timeline.to(
      dotsContainer,
      {
        autoAlpha: 1,
        y: 0,

        duration: 0.3,
        ease: 'power2.out',
      },
      0.52
    );
  }

  if (progressContainer) {
    timeline.to(
      progressContainer,
      {
        autoAlpha: 1,

        duration: 0.3,
        ease: 'power2.out',
      },
      0.52
    );
  }

  timeline.to(
    firstSlide,
    {
      duration: 0.15,
    },
    0.85
  );
}

function addProjectTransitions(
  timeline: gsap.core.Timeline,
  slides: HTMLElement[],
  mobile: boolean
): void {
  if (slides.length <= 1) {
    return;
  }

  for (
    let index = 1;
    index < slides.length;
    index += 1
  ) {
    const previousSlide =
      slides[index - 1];

    const currentSlide =
      slides[index];

    const position = index;

    timeline.to(
      previousSlide,
      {
        autoAlpha: 0,

        xPercent: mobile
          ? -7
          : -11,

        yPercent: mobile
          ? -12
          : -22,

        scale: mobile
          ? 0.95
          : 0.9,

        rotateX: mobile
          ? 0
          : 4,

        filter: mobile
          ? 'blur(6px)'
          : 'blur(10px)',

        duration: 0.4,
        ease: 'power1.in',
      },
      position
    );

    timeline.fromTo(
      currentSlide,
      {
        autoAlpha: 0,

        xPercent: mobile
          ? 7
          : 12,

        yPercent: mobile
          ? 42
          : 55,

        scale: mobile
          ? 0.95
          : 0.9,

        rotateX: mobile
          ? 0
          : -5,

        filter: mobile
          ? 'blur(6px)'
          : 'blur(10px)',
      },
      {
        autoAlpha: 1,

        xPercent: 0,
        yPercent: 0,

        scale: 1,
        rotateX: 0,

        filter: 'blur(0px)',

        duration: 0.52,
        ease: 'power2.out',
      },
      position + 0.27
    );

    timeline.to(
      currentSlide,
      {
        duration: 0.2,
      },
      position + 0.8
    );
  }
}

function createScrollAnimation(
  dom: ProjectDOM,
  mobile: boolean
): CleanupFunction {
  const {
    section,
    sticky,
    slides,
    progressFill,
  } = dom;

  const projectCount = slides.length;

  /*
   * Hay un segmento inicial:
   * estado 00 → proyecto 01.
   */
  const timelineSegments = Math.max(
    projectCount,
    1
  );

  const scrollPerSegment =
    mobile ? 0.7 : 0.82;

  const timeline = gsap.timeline({
    defaults: {
      ease: 'none',
    },

    scrollTrigger: {
      id: 'projects-scroll',

      trigger: section,

      /*
       * Mantener en top top.
       */
      start: 'top top',

      end: () => {
        const distance =
          window.innerHeight *
          timelineSegments *
          scrollPerSegment;

        return `+=${distance}`;
      },

      pin: sticky,
      pinSpacing: true,

      scrub: mobile
        ? 0.45
        : 0.7,

      anticipatePin: 1,
      invalidateOnRefresh: true,

      snap:
        projectCount > 0
          ? {
              snapTo: 1 / projectCount,

              duration: {
                min: 0.12,
                max: mobile
                  ? 0.3
                  : 0.42,
              },

              delay: 0.04,
              ease: 'power1.inOut',
            }
          : undefined,

      onUpdate(scrollTrigger) {
        const stateIndex =
          getActiveState(
            scrollTrigger.progress,
            projectCount
          );

        updateActiveState(
          dom,
          stateIndex
        );
      },

      onEnter(scrollTrigger) {
        const stateIndex =
          getActiveState(
            scrollTrigger.progress,
            projectCount
          );

        updateActiveState(
          dom,
          stateIndex
        );
      },

      onEnterBack(scrollTrigger) {
        const stateIndex =
          getActiveState(
            scrollTrigger.progress,
            projectCount
          );

        updateActiveState(
          dom,
          stateIndex
        );
      },

      onLeaveBack() {
        updateActiveState(dom, 0);
      },
    },
  });

  addInitialReveal(
    timeline,
    dom,
    mobile
  );

  addProjectTransitions(
    timeline,
    slides,
    mobile
  );

  if (progressFill) {
    timeline.to(
      progressFill,
      {
        scaleY: 1,

        duration: timelineSegments,
        ease: 'none',
      },
      0
    );
  }

  return () => {
    timeline.scrollTrigger?.kill();
    timeline.kill();
  };
}

function createReducedMotionLayout(
  dom: ProjectDOM
): CleanupFunction {
  const {
    sticky,
    stage,
    slides,
    progressContainer,
    progressFill,
    aboutPanel,
    projectHeader,
    dotsContainer,
    scrollIndicator,
  } = dom;

  gsap.set(sticky, {
    height: 'auto',
    minHeight: 'auto',
    maxHeight: 'none',
    overflow: 'visible',
  });

  if (stage) {
    gsap.set(stage, {
      position: 'relative',
      display: 'grid',
      height: 'auto',
      minHeight: 'auto',
      gap: '1rem',
    });
  }

  const visibleElements = [
    aboutPanel,
    projectHeader,
    dotsContainer,
    progressContainer,
  ].filter(
    (
      element
    ): element is HTMLElement =>
      element instanceof HTMLElement
  );

  gsap.set(visibleElements, {
    autoAlpha: 1,
    xPercent: 0,
    yPercent: 0,
    y: 0,
    filter: 'none',
  });

  gsap.set(slides, {
    position: 'relative',
    inset: 'auto',

    width: '100%',
    height: 'auto',
    minHeight: '24rem',

    autoAlpha: 1,
    visibility: 'visible',

    xPercent: 0,
    yPercent: 0,

    scale: 1,
    rotateX: 0,
    filter: 'none',

    pointerEvents: 'auto',
  });

  if (progressFill) {
    gsap.set(progressFill, {
      scaleY: 1,
    });
  }

  if (scrollIndicator) {
    gsap.set(scrollIndicator, {
      display: 'none',
    });
  }

  slides.forEach((slide) => {
    slide.setAttribute(
      'aria-hidden',
      'false'
    );

    if ('inert' in slide) {
      slide.inert = false;
    }
  });

  return () => {
    const elements = [
      sticky,
      stage,
      ...slides,
      progressContainer,
      progressFill,
      aboutPanel,
      projectHeader,
      dotsContainer,
      scrollIndicator,
    ].filter(
      (
        element
      ): element is HTMLElement =>
        element instanceof HTMLElement
    );

    gsap.set(elements, {
      clearProps: 'all',
    });
  };
}

function observeProjectImages(
  section: HTMLElement
): CleanupFunction {
  const images = Array.from(
    section.querySelectorAll<HTMLImageElement>(
      'img'
    )
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
  };
}

function initializeProjects():
  | CleanupFunction
  | undefined {
  const dom = getProjectDOM();

  if (!dom) {
    return;
  }

  ScrollTrigger.getById(
    'projects-scroll'
  )?.kill();

  setInitialStates(dom);

  const media = gsap.matchMedia();

  media.add(
    '(min-width: 701px) and (prefers-reduced-motion: no-preference)',
    () => {
      return createScrollAnimation(
        dom,
        false
      );
    }
  );

  media.add(
    '(max-width: 700px) and (prefers-reduced-motion: no-preference)',
    () => {
      return createScrollAnimation(
        dom,
        true
      );
    }
  );

  media.add(
    '(prefers-reduced-motion: reduce)',
    () => {
      return createReducedMotionLayout(
        dom
      );
    }
  );

  const cleanupImages =
    observeProjectImages(dom.section);

  window.requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });

  return () => {
    cleanupImages();
    media.revert();

    ScrollTrigger.getById(
      'projects-scroll'
    )?.kill();
  };
}

function startProjects(): void {
  cleanupCurrentAnimation?.();

  cleanupCurrentAnimation =
    initializeProjects();
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    startProjects,
    { once: true }
  );
} else {
  startProjects();
}

document.addEventListener(
  'astro:page-load',
  startProjects
);

document.addEventListener(
  'astro:before-swap',
  () => {
    cleanupCurrentAnimation?.();
    cleanupCurrentAnimation = undefined;
  }
);