import type { APIRoute } from 'astro';
import { Resend } from 'resend';

/*
 * Solo este endpoint se renderiza bajo demanda.
 * Las demás páginas pueden continuar estáticas.
 */
export const prerender = false;

type ContactRequestBody = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  projectType?: unknown;
  message?: unknown;
  website?: unknown;
};

type ErrorResponse = {
  success: false;
  message: string;
};

type SuccessResponse = {
  success: true;
  message: string;
};

const MAX_NAME_LENGTH = 80;
const MAX_EMAIL_LENGTH = 150;
const MAX_COMPANY_LENGTH = 120;
const MAX_PROJECT_TYPE_LENGTH = 80;
const MAX_MESSAGE_LENGTH = 5000;

/**
 * Limpia y limita valores recibidos.
 */
function cleanText(
  value: unknown,
  maxLength: number
): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value
    .replace(/\0/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Validación sencilla del correo.
 */
function isValidEmail(
  value: string
): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}

/**
 * Escapa contenido introducido por el usuario
 * antes de insertarlo en el HTML del correo.
 */
function escapeHtml(
  value: string
): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Respuesta JSON uniforme.
 */
function jsonResponse(
  body: ErrorResponse | SuccessResponse,
  status = 200
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,

      headers: {
        'Content-Type':
          'application/json; charset=utf-8',

        'Cache-Control':
          'no-store',
      },
    }
  );
}

/**
 * Verifica que la petición provenga del mismo sitio.
 */
function isAllowedOrigin(
  request: Request
): boolean {
  const origin =
    request.headers.get('origin');

  /*
   * Algunas peticiones del mismo servidor pueden
   * no incluir Origin.
   */
  if (!origin) {
    return true;
  }

  try {
    const requestURL =
      new URL(request.url);

    const originURL =
      new URL(origin);

    return (
      requestURL.host ===
      originURL.host
    );
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({
  request,
}) => {
  try {
    if (!isAllowedOrigin(request)) {
      return jsonResponse(
        {
          success: false,
          message:
            'La solicitud no está autorizada.',
        },
        403
      );
    }

    const apiKey =
      import.meta.env.RESEND_API_KEY;

    const destinationEmail =
      import.meta.env.CONTACT_EMAIL;

    const senderEmail =
      import.meta.env.CONTACT_FROM;

    if (
      !apiKey ||
      !destinationEmail ||
      !senderEmail
    ) {
      console.error(
        'Faltan variables de entorno para el formulario.'
      );

      return jsonResponse(
        {
          success: false,
          message:
            'El servicio de contacto no está configurado.',
        },
        500
      );
    }

    const contentType =
      request.headers.get(
        'content-type'
      ) ?? '';

    if (
      !contentType.includes(
        'application/json'
      )
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            'El formato enviado no es válido.',
        },
        415
      );
    }

    let body: ContactRequestBody;

    try {
      body =
        await request.json() as ContactRequestBody;
    } catch {
      return jsonResponse(
        {
          success: false,
          message:
            'No se pudo leer la solicitud.',
        },
        400
      );
    }

    const name = cleanText(
      body.name,
      MAX_NAME_LENGTH
    );

    const email = cleanText(
      body.email,
      MAX_EMAIL_LENGTH
    );

    const company = cleanText(
      body.company,
      MAX_COMPANY_LENGTH
    );

    const projectType = cleanText(
      body.projectType,
      MAX_PROJECT_TYPE_LENGTH
    );

    const message = cleanText(
      body.message,
      MAX_MESSAGE_LENGTH
    );

    /*
     * Honeypot: un visitante real nunca llena
     * este campo oculto.
     */
    const website = cleanText(
      body.website,
      200
    );

    if (website) {
      /*
       * Simulamos éxito para no revelar al bot
       * que fue detectado.
       */
      return jsonResponse({
        success: true,
        message:
          'Tu mensaje fue enviado correctamente.',
      });
    }

    if (
      name.length < 2 ||
      !email ||
      !projectType ||
      message.length < 10
    ) {
      return jsonResponse(
        {
          success: false,
          message:
            'Completa correctamente todos los campos obligatorios.',
        },
        400
      );
    }

    if (!isValidEmail(email)) {
      return jsonResponse(
        {
          success: false,
          message:
            'Introduce un correo electrónico válido.',
        },
        400
      );
    }

    const safeName =
      escapeHtml(name);

    const safeEmail =
      escapeHtml(email);

    const safeCompany =
      escapeHtml(
        company || 'No especificada'
      );

    const safeProjectType =
      escapeHtml(projectType);

    const safeMessage =
      escapeHtml(message)
        .replaceAll(
          '\n',
          '<br />'
        );

    const resend =
      new Resend(apiKey);

    const {
      data,
      error,
    } = await resend.emails.send({
      from: senderEmail,

      to: [
        destinationEmail,
      ],

      /*
       * Cuando pulses Responder en tu correo,
       * se responderá al visitante.
       */
      replyTo: email,

      subject:
        `Nuevo proyecto de ${name}`,

      html: `
        <!doctype html>
        <html lang="es">
          <head>
            <meta charset="UTF-8" />

            <meta
              name="viewport"
              content="width=device-width"
            />
          </head>

          <body
            style="
              margin: 0;
              padding: 32px 16px;
              background: #121212;
              color: #ffffff;
              font-family:
                Arial,
                Helvetica,
                sans-serif;
            "
          >
            <div
              style="
                width: 100%;
                max-width: 640px;
                margin: 0 auto;
              "
            >
              <div
                style="
                  padding: 32px;
                  background: #1b1b1b;
                  border:
                    1px solid #333333;
                  border-radius: 20px;
                "
              >
                <p
                  style="
                    margin: 0 0 12px;
                    color: #00ffcc;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                  "
                >
                  Deredaya · Nuevo contacto
                </p>

                <h1
                  style="
                    margin: 0 0 32px;
                    color: #ffffff;
                    font-size: 30px;
                    line-height: 1.1;
                  "
                >
                  Nueva solicitud de proyecto
                </h1>

                <table
                  role="presentation"
                  style="
                    width: 100%;
                    border-collapse: collapse;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding: 12px 0;
                        color: #999999;
                      "
                    >
                      Nombre
                    </td>

                    <td
                      style="
                        padding: 12px 0;
                        color: #ffffff;
                        text-align: right;
                      "
                    >
                      ${safeName}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 12px 0;
                        color: #999999;
                        border-top:
                          1px solid #333333;
                      "
                    >
                      Correo
                    </td>

                    <td
                      style="
                        padding: 12px 0;
                        color: #ffffff;
                        text-align: right;
                        border-top:
                          1px solid #333333;
                      "
                    >
                      ${safeEmail}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 12px 0;
                        color: #999999;
                        border-top:
                          1px solid #333333;
                      "
                    >
                      Empresa
                    </td>

                    <td
                      style="
                        padding: 12px 0;
                        color: #ffffff;
                        text-align: right;
                        border-top:
                          1px solid #333333;
                      "
                    >
                      ${safeCompany}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding: 12px 0;
                        color: #999999;
                        border-top:
                          1px solid #333333;
                      "
                    >
                      Tipo de proyecto
                    </td>

                    <td
                      style="
                        padding: 12px 0;
                        color: #ffffff;
                        text-align: right;
                        border-top:
                          1px solid #333333;
                      "
                    >
                      ${safeProjectType}
                    </td>
                  </tr>
                </table>

                <div
                  style="
                    margin-top: 28px;
                    padding: 20px;
                    background: #111111;
                    border-radius: 14px;
                  "
                >
                  <p
                    style="
                      margin: 0 0 10px;
                      color: #999999;
                      font-size: 12px;
                      font-weight: 700;
                      letter-spacing: 1px;
                      text-transform: uppercase;
                    "
                  >
                    Mensaje
                  </p>

                  <p
                    style="
                      margin: 0;
                      color: #ffffff;
                      line-height: 1.7;
                    "
                  >
                    ${safeMessage}
                  </p>
                </div>

                <a
                  href="mailto:${safeEmail}"
                  style="
                    display: inline-block;
                    margin-top: 24px;
                    padding: 12px 18px;
                    color: #001b16;
                    background: #00ffcc;
                    border-radius: 999px;
                    font-size: 12px;
                    font-weight: 700;
                    text-decoration: none;
                    text-transform: uppercase;
                  "
                >
                  Responder a ${safeName}
                </a>
              </div>
            </div>
          </body>
        </html>
      `,

      text: [
        'Nueva solicitud de proyecto',
        '',
        `Nombre: ${name}`,
        `Correo: ${email}`,
        `Empresa: ${
          company || 'No especificada'
        }`,
        `Tipo de proyecto: ${projectType}`,
        '',
        'Mensaje:',
        message,
      ].join('\n'),
    });

    if (error) {
      console.error(
        'Resend devolvió un error:',
        error
      );

      return jsonResponse(
        {
          success: false,
          message:
            'No fue posible enviar el mensaje. Inténtalo nuevamente.',
        },
        502
      );
    }

    console.info(
      'Correo enviado:',
      data?.id
    );

    return jsonResponse({
      success: true,
      message:
        'Tu mensaje fue enviado correctamente.',
    });
  } catch (error) {
    console.error(
      'Error inesperado en /api/contact:',
      error
    );

    return jsonResponse(
      {
        success: false,
        message:
          'Ocurrió un error inesperado. Inténtalo más tarde.',
      },
      500
    );
  }
};

/**
 * Rechaza otros métodos.
 */
export const ALL: APIRoute = async () => {
  return jsonResponse(
    {
      success: false,
      message:
        'Método no permitido.',
    },
    405
  );
};