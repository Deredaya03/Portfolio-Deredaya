import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type CleanupFunction = () => void;

type ContactResponse = {
  success?: boolean;
  message?: string;
};

type StatusType =
  | 'success'
  | 'error'
  | 'info'
  | '';

let cleanupContactPage:
  | CleanupFunction
  | undefined;

/**
 * Convierte FormData en el objeto enviado al endpoint.
 */
function createContactPayload(
  form: HTMLFormElement
) {
  const formData = new FormData(form);

  return {
    name: String(
      formData.get('name') ?? ''
    ).trim(),

    email: String(
      formData.get('email') ?? ''
    ).trim(),

    company: String(
      formData.get('company') ?? ''
    ).trim(),

    projectType: String(
      formData.get('projectType') ?? ''
    ).trim(),

    message: String(
      formData.get('message') ?? ''
    ).trim(),

    website: String(
      formData.get('website') ?? ''
    ).trim(),
  };
}

/**
 * Inicializa la página de contacto.
 */
function initializeContactPage():
  | CleanupFunction
  | undefined {
  const page =
    document.querySelector<HTMLElement>(
      '.contact-page'
    );

  if (!page) {
    return;
  }

  const form =
    page.querySelector<HTMLFormElement>(
      '[data-contact-form]'
    );

  const submitButton =
    page.querySelector<HTMLButtonElement>(
      '[data-contact-submit]'
    );

  const submitText =
    page.querySelector<HTMLElement>(
      '[data-contact-submit-text]'
    );

  const statusElement =
    page.querySelector<HTMLElement>(
      '[data-contact-status]'
    );

  const copyButton =
    page.querySelector<HTMLButtonElement>(
      '[data-contact-copy]'
    );

  const copyText =
    copyButton?.querySelector<HTMLElement>(
      '[data-contact-copy-text]'
    );

  const originalSubmitText =
    submitText?.textContent?.trim() ??
    'Enviar mensaje';

  const originalCopyText =
    copyText?.textContent?.trim() ??
    'Copiar correo';

  let copyTimeout:
    | number
    | undefined;

  /**
   * Actualiza el aviso debajo del formulario.
   */
  const setStatus = (
    message: string,
    type: StatusType
  ): void => {
    if (!statusElement) {
      return;
    }

    statusElement.textContent = message;
    statusElement.dataset.status = type;
  };

  /**
   * Activa o desactiva el estado de carga.
   */
  const setSubmitting = (
    submitting: boolean
  ): void => {
    if (submitButton) {
      submitButton.disabled = submitting;
      submitButton.setAttribute(
        'aria-busy',
        String(submitting)
      );
    }

    if (submitText) {
      submitText.textContent = submitting
        ? 'Enviando...'
        : originalSubmitText;
    }
  };

  /**
   * Envía directamente al endpoint de Astro.
   */
  const handleSubmit = async (
    event: SubmitEvent
  ): Promise<void> => {
    event.preventDefault();

    if (!form || !form.reportValidity()) {
      return;
    }

    setSubmitting(true);
    setStatus(
      'Enviando tu mensaje...',
      'info'
    );

    try {
      const response = await fetch(
        '/api/contact',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json',
          },

          body: JSON.stringify(
            createContactPayload(form)
          ),
        }
      );

      let result: ContactResponse;

      try {
        result =
          await response.json() as ContactResponse;
      } catch {
        throw new Error(
          'El servidor devolvió una respuesta no válida.'
        );
      }

      if (
        !response.ok ||
        result.success !== true
      ) {
        throw new Error(
          result.message ??
            'No fue posible enviar el mensaje.'
        );
      }

      setStatus(
        result.message ??
          'Tu mensaje fue enviado correctamente.',
        'success'
      );

      form.reset();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No fue posible enviar el mensaje.';

      setStatus(
        message,
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Copia el correo al portapapeles.
   */
  const handleCopy = async (): Promise<void> => {
    if (!copyButton || !copyText) {
      return;
    }

    const email =
      copyButton.dataset.email;

    if (!email) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        email
      );

      copyText.textContent =
        'Correo copiado';

      if (copyTimeout) {
        window.clearTimeout(copyTimeout);
      }

      copyTimeout = window.setTimeout(
        () => {
          copyText.textContent =
            originalCopyText;
        },
        1800
      );
    } catch {
      copyText.textContent =
        'No se pudo copiar';

      if (copyTimeout) {
        window.clearTimeout(copyTimeout);
      }

      copyTimeout = window.setTimeout(
        () => {
          copyText.textContent =
            originalCopyText;
        },
        1800
      );
    }
  };

  form?.addEventListener(
    'submit',
    handleSubmit
  );

  copyButton?.addEventListener(
    'click',
    handleCopy
  );

  /*
   * Animaciones.
   */
  const context = gsap.context(() => {
    const reducedMotion =
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

    const revealElements =
      gsap.utils.toArray<HTMLElement>(
        '[data-contact-reveal]',
        page
      );

    const processCards =
      gsap.utils.toArray<HTMLElement>(
        '[data-contact-card]',
        page
      );

    if (reducedMotion) {
      gsap.set(
        [
          ...revealElements,
          ...processCards,
        ],
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: 'none',
        }
      );

      return;
    }

    revealElements.forEach(
      (element) => {
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
      }
    );

    processCards.forEach(
      (card, index) => {
        gsap.fromTo(
          card,
          {
            autoAlpha: 0,
            y: 65,
            scale: 0.95,
            filter: 'blur(8px)',
          },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',

            duration: 0.85,
            delay: Math.min(
              index * 0.08,
              0.24
            ),
            ease: 'power3.out',

            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              once: true,
            },
          }
        );
      }
    );
  }, page);

  window.requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });

  return () => {
    form?.removeEventListener(
      'submit',
      handleSubmit
    );

    copyButton?.removeEventListener(
      'click',
      handleCopy
    );

    if (copyTimeout) {
      window.clearTimeout(copyTimeout);
    }

    context.revert();
  };
}

/**
 * Reinicia evitando duplicar eventos con Astro.
 */
function startContactPage(): void {
  cleanupContactPage?.();

  cleanupContactPage =
    initializeContactPage();
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    startContactPage,
    {
      once: true,
    }
  );
} else {
  startContactPage();
}

document.addEventListener(
  'astro:page-load',
  startContactPage
);

document.addEventListener(
  'astro:before-swap',
  () => {
    cleanupContactPage?.();
    cleanupContactPage = undefined;
  }
);