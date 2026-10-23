import nodemailer, { Transporter } from "nodemailer";
import { format } from "date-fns";
import axios from "axios";
import { ProporsalAttributes } from "../models/Proporsal";

const BRAND = {
  dark: "#11232e",
  light: "#f6f3e8",
  accent: "#c4b08d",
  background: "#fafafa",
  textDark: "#11232e",
  textMuted: "#393d47",
  textOnDark: "#f6f3e8",
  textMutedOnDark: "#e2ddd1",
} as const;

const FONT_DISPLAY =
  "'GT Super DS', 'GT Super Display', 'Playfair Display', Georgia, 'Times New Roman', serif";
const FONT_BODY =
  "'Neue Haas Grotesk Text', 'Neue Haas Grotesk Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const FONT_LABEL = "'Neue Haas Grotesk Display', 'Helvetica Neue', Helvetica, Arial, sans-serif";

const EMAIL_LOGO_CID = "kennedys-logo";

const getWebBaseUrl = (): string => {
  const base =
    process.env.EMAIL_ASSET_BASE_URL ||
    process.env.WEB_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:3002";
  return String(base).replace(/\/$/, "");
};

/**
 * Email clients frequently block SVG. Prefer a PNG derived from the canonical web logo.svg.
 * Override via EMAIL_LOGO_URL if needed.
 */
const getLogoUrl = (): string =>
  process.env.EMAIL_LOGO_URL || `${getWebBaseUrl()}/images/logo-email.png`;

const getLogoSrc = (): string =>
  process.env.EMAIL_LOGO_CID_PATH?.trim() ? `cid:${EMAIL_LOGO_CID}` : getLogoUrl();

const getLogoAttachments = () => {
  const logoPath = process.env.EMAIL_LOGO_CID_PATH?.trim();
  if (!logoPath) return undefined;

  return [
    {
      filename: "kennedys-logo.png",
      path: logoPath,
      cid: EMAIL_LOGO_CID,
    },
  ];
};

const buildTransporter = (): Transporter => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port) {
    throw new Error("SMTP_HOST and SMTP_PORT must be configured to send emails");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
};

let cachedTransporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (!cachedTransporter) {
    cachedTransporter = buildTransporter();
  }
  return cachedTransporter;
};

const formatDate = (value?: Date | string | null): string => {
  if (!value) return "To be defined";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "To be defined" : format(date, "EEE, MMM dd yyyy");
};

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const escapeHtmlWithBreaks = (value?: string | null): string =>
  escapeHtml(value).replace(/\r?\n/g, "<br/>");

const renderCtaButton = (href: string, label: string) => {
  const safeHref = escapeHtml(href);
  const safeLabel = escapeHtml(label);

  return `
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    <tr>
      <td align="left" style="padding: 0;">
        <div align="left">
          <a href="${safeHref}" target="_blank" rel="noopener" style="color:${BRAND.dark};text-decoration:none;">
            <!--[if mso]>
            <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${safeHref}" style="height:42px;v-text-anchor:middle;" arcsize="0%" fill="false">
              <v:stroke dashstyle="Solid" weight="1px" color="${BRAND.dark}"/>
              <w:anchorlock/>
              <v:textbox inset="0px,0px,0px,0px">
                <center dir="false" style="color:${BRAND.dark};font-family:sans-serif;font-size:16px">
            <![endif]-->
            <span style="background-color: transparent; border: 1px solid ${BRAND.dark}; color: ${BRAND.dark}; display: inline-block; font-family: ${FONT_LABEL}; font-size: 14px; font-weight: 600; mso-border-alt: none; text-align: center; width: auto; word-break: keep-all; letter-spacing: 1.6px; text-transform: uppercase;">
              <span style="padding-left: 30px; padding-right: 30px; padding-top: 5px; padding-bottom: 5px; display: block;">
                <span style="line-height: 32px;">${safeLabel}</span>
              </span>
            </span>
            <!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
          </a>
        </div>
      </td>
    </tr>
  </table>`;
};

type EmailDetailItem = { label: string; valueHtml: string };

const renderDetailsGrid = (items: EmailDetailItem[]) => {
  if (!items.length) return "";

  const rows: Array<[EmailDetailItem, EmailDetailItem | null]> = [];
  for (let idx = 0; idx < items.length; idx += 2) {
    rows.push([items[idx], items[idx + 1] || null]);
  }

  return `
  <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
    ${rows
      .map(([left, right]) => {
        const cell = (item: EmailDetailItem) => `
        <td width="50%" valign="top" style="padding: 10px 12px;">
          <div style="color:${BRAND.accent};font-family:${FONT_LABEL};font-size:11px;font-weight:700;letter-spacing:1.6px;line-height:1.2;text-transform:uppercase;">
            ${escapeHtml(item.label)}
          </div>
          <div style="height:8px;line-height:8px;font-size:1px;">&#8202;</div>
          <div style="color:${BRAND.textDark};font-family:${FONT_BODY};font-size:14px;font-weight:400;letter-spacing:0px;line-height:1.6;">
            ${item.valueHtml}
          </div>
        </td>`;

        return `
        <tr>
          ${cell(left)}
          ${
            right
              ? cell(right)
              : `<td width="50%" valign="top" style="padding: 10px 12px;">&nbsp;</td>`
          }
        </tr>`;
      })
      .join("")}
  </table>`;
};

const buildKennedysEmailHtml = (params: {
  title: string;
  eyebrow?: string;
  leadHtml?: string;
  cta?: { href: string; label: string };
  details?: EmailDetailItem[];
  extraHtml?: string;
  footerHtml?: string;
  preheader?: string;
}) => {
  const logoUrl = getLogoSrc();
  const preheader = params.preheader?.trim() ? escapeHtml(params.preheader.trim()) : "";

  const lead = params.leadHtml?.trim()
    ? `<table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td style="padding: 0 0 0 0;">
            <div style="color:${BRAND.textMuted};direction:ltr;font-family:${FONT_BODY};font-size:15px;font-weight:400;letter-spacing:0px;line-height:1.7;text-align:left;">
              ${params.leadHtml}
            </div>
          </td>
        </tr>
      </table>`
    : "";

  const eyebrow = params.eyebrow?.trim()
    ? `<table class="paragraph_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;word-break:break-word;">
        <tr>
          <td style="padding: 0 0 0 0;">
            <div style="color:${BRAND.accent};direction:ltr;font-family:${FONT_LABEL};font-size:11px;font-weight:700;letter-spacing:2.4px;line-height:1.2;text-align:left;text-transform:uppercase;">
              ${escapeHtml(params.eyebrow)}
            </div>
          </td>
        </tr>
      </table>
      <div style="height:10px;line-height:10px;font-size:1px;">&#8202;</div>`
    : "";

  const cta = params.cta ? renderCtaButton(params.cta.href, params.cta.label) : "";

  const details = params.details?.length
    ? `
    <table class="row row-details" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
      <tbody>
        <tr>
          <td>
            <table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:${BRAND.light};color:#000000;padding:22px 20px;width:680px;margin:0 auto;border:1px solid rgba(196,176,141,0.35);" width="680">
              <tbody>
                <tr>
                  <td style="padding: 0;">
                    ${renderDetailsGrid(params.details)}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>`
    : "";

  const extra = params.extraHtml?.trim()
    ? `
    <table class="row row-extra" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
      <tbody>
        <tr>
          <td>
            <table class="row-content" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:#ffffff;color:#000000;padding:25px 30px;width:680px;margin:0 auto;" width="680">
              <tbody>
                <tr>
                  <td>
                    ${params.extraHtml}
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>`
    : "";

  const footerHtml =
    params.footerHtml?.trim() ||
    `<div style="color:${BRAND.textMutedOnDark};direction:ltr;font-family:${FONT_BODY};font-size:12px;font-weight:400;letter-spacing:0px;line-height:1.6;text-align:center;">
      This email was generated automatically by kennedys-api.
    </div>`;

  return `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
  <head>
    <title>${escapeHtml(params.title)}</title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--[if mso]>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml>
    <![endif]-->
    <!--[if !mso]><!-->
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900" rel="stylesheet" type="text/css">
    <!--<![endif]-->
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; }
      img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
      a[x-apple-data-detectors] { color: inherit !important; text-decoration: inherit !important; }
      #MessageViewBody a { color: inherit; text-decoration: none; }
      p { line-height: inherit; }
      .mobile_hide { display: block; }
      @media (max-width:700px) {
        .row-content { width: 100% !important; }
        .stack .column { width: 100%; display: block; }
        .mobile_hide { display: none !important; max-height: 0px; overflow: hidden; font-size: 0px; }
      }
    </style>
  </head>
  <body style="background-color:${BRAND.background}; margin:0; padding:0; -webkit-text-size-adjust:none; text-size-adjust:none;">
    ${
      preheader
        ? `<div style="display:none;font-size:1px;color:${BRAND.background};line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</div>`
        : ""
    }
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:${BRAND.background};">
      <tbody>
        <tr>
          <td>
            <table class="row row-1" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
              <tbody>
                <tr>
                  <td>
                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:${BRAND.dark};color:#000000;padding:18px;width:680px;margin:0 auto;" width="680">
                      <tbody>
                        <tr>
                          <td class="column column-1" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;font-weight:400;text-align:left;vertical-align:top;">
                            <table class="image_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
                              <tr>
                                <td style="width:100%;padding-right:0px;padding-left:0px;">
                                  <div align="center">
                                    <div style="max-width: 220px;">
                                      <img src="${escapeHtml(logoUrl)}" style="display:block;height:auto;border:0;width:100%;max-width:220px;" width="220" alt="Kennedys Group" title="Kennedys Group" height="auto">
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <table class="row row-2" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
              <tbody>
                <tr>
                  <td>
                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;background-repeat:no-repeat;background-size:auto;padding-left:34px;padding-right:34px;color:#000000;background-color:#ffffff;background-image:none;width:680px;margin:0 auto;border-left:1px solid rgba(17,35,46,0.06);border-right:1px solid rgba(17,35,46,0.06);" width="680">
                      <tbody>
                        <tr>
                          <td class="column column-1" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;font-weight:400;text-align:left;vertical-align:top;">
                            <div style="height:28px;line-height:28px;font-size:1px;">&#8202;</div>
                            ${eyebrow}
                            <table class="heading_block" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
                              <tr>
                                <td style="text-align:center;width:100%;">
                                  <h1 style="margin:0;color:${BRAND.dark};direction:ltr;font-family:${FONT_DISPLAY};font-size:36px;font-weight:400;letter-spacing:0.4px;line-height:1.18;text-align:left;mso-line-height-alt:43px;">
                                    ${escapeHtml(params.title)}
                                  </h1>
                                </td>
                              </tr>
                            </table>
                            <div style="height:12px;line-height:12px;font-size:1px;">&#8202;</div>
                            <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
                              <tr>
                                <td style="padding: 0;">
                                  <div style="height:1px;line-height:1px;font-size:1px;background-color:rgba(196,176,141,0.55);width:64px;">&#8202;</div>
                                </td>
                              </tr>
                            </table>
                            <div style="height:18px;line-height:18px;font-size:1px;">&#8202;</div>
                            ${lead}
                            ${cta ? `<div style="height:22px;line-height:22px;font-size:1px;">&#8202;</div>${cta}` : ""}
                            <div style="height:28px;line-height:28px;font-size:1px;">&#8202;</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            ${details}
            ${extra}

            <table class="row row-footer" align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
              <tbody>
                <tr>
                  <td>
                    <table class="row-content stack" align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;background-color:${BRAND.dark};color:#000000;padding:22px 30px;width:680px;margin:0 auto;" width="680">
                      <tbody>
                        <tr>
                          <td class="column column-1" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;font-weight:400;text-align:left;vertical-align:top;">
                            ${footerHtml}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>`;
};

const buildTripInquiryHtml = (inquiry: ProporsalAttributes, propertyUrl?: string) => {
  const guestName = [inquiry.firstName, inquiry.lastName].filter(Boolean).join(" ") || "Guest";
  const startDate = formatDate(inquiry.preferredStartDate);
  const endDate = formatDate(inquiry.preferredEndDate);
  const propertyLine = inquiry.propertyName
    ? `${inquiry.propertyName}${inquiry.propertyLocation ? ` · ${inquiry.propertyLocation}` : ""}`
    : inquiry.propertyLocation || "Location upon request";

  const details: EmailDetailItem[] = [
    { label: "Guest", valueHtml: escapeHtml(guestName) },
    {
      label: "Contact",
      valueHtml: `${escapeHtml(inquiry.email || "—")}<br/>${escapeHtml(inquiry.phone || "—")}`,
    },
    { label: "Check-in", valueHtml: escapeHtml(startDate) },
    { label: "Check-out", valueHtml: escapeHtml(endDate) },
    { label: "Property", valueHtml: escapeHtml(propertyLine) },
  ];

  if (inquiry.message?.trim()) {
    details.push({ label: "Guest message", valueHtml: escapeHtmlWithBreaks(inquiry.message) });
  }

  return buildKennedysEmailHtml({
    title: "New trip inquiry received",
    eyebrow: "Trip inquiry",
    preheader: `${guestName} – ${inquiry.propertyName || "Kennedys"}`,
    leadHtml: `<p style="margin:0;">${escapeHtml(guestName)} is requesting a bespoke stay${
      inquiry.propertyName ? ` at <strong>${escapeHtml(inquiry.propertyName)}</strong>.` : "."
    }</p>`,
    cta: propertyUrl
      ? { href: propertyUrl, label: "Open property" }
      : undefined,
    details,
  });
};

const buildTextBody = (inquiry: ProporsalAttributes): string => {
  const guestName = [inquiry.firstName, inquiry.lastName].filter(Boolean).join(" ") || "Guest";
  const lines = [
    "New trip inquiry",
    "",
    `Guest: ${guestName}`,
    `Email: ${inquiry.email || "—"}`,
    `Phone: ${inquiry.phone || "—"}`,
    `Check-in: ${formatDate(inquiry.preferredStartDate)}`,
    `Check-out: ${formatDate(inquiry.preferredEndDate)}`,
    `Property: ${inquiry.propertyName || inquiry.propertyLocation || "—"}`,
  ];

  if (inquiry.message) {
    lines.push("", inquiry.message);
  }

  return lines.filter(Boolean).join("\n");
};

const getRecipients = (): string[] => {
  const raw = process.env.TRIP_INQUIRY_RECIPIENTS || process.env.SMTP_DEFAULT_TO || "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const isEmailConfigured = () => {
  try {
    return Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && getRecipients().length);
  } catch (error) {
    return false;
  }
};

export const sendPlanYourTripEmail = async (inquiry: ProporsalAttributes) => {
  const recipients = getRecipients();
  if (!recipients.length) {
    console.warn("Trip inquiry email skipped: TRIP_INQUIRY_RECIPIENTS is empty");
    return;
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error("SMTP_FROM or SMTP_USER must be provided to send emails");
  }

  const subject = `New trip inquiry – ${inquiry.propertyName || "Kennedys"}`;
  const html = buildTripInquiryHtml(inquiry, inquiry.url || undefined);
  const text = buildTextBody(inquiry);

  const mailOptions = {
    from,
    to: recipients,
    replyTo: inquiry.email || undefined,
    subject,
    html,
    text,
    attachments: getLogoAttachments(),
  };

  await getTransporter().sendMail(mailOptions);
};

export const sendVerificationCodeEmail = async (email: string, code: string, firstName?: string) => {
  const userName = firstName || "User";
  const subject = "Your Kennedys Group Verification Code";

  const safeCode = escapeHtml(code);
  const html = buildKennedysEmailHtml({
    title: "Verification code",
    eyebrow: "Security",
    preheader: `Your verification code: ${code}`,
    leadHtml: `<p style="margin:0;">Hello ${escapeHtml(userName)},</p>
      <div style="height:10px;line-height:10px;font-size:1px;">&#8202;</div>
      <p style="margin:0;">Please use the following code to verify your email address:</p>`,
    extraHtml: `
      <table width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;">
        <tr>
          <td style="padding: 10px 0 0 0;">
            <div style="background:${BRAND.light};border:1px solid ${BRAND.accent};padding:18px 16px;text-align:center;">
              <div style="color:${BRAND.dark};font-family:${FONT_LABEL};font-size:34px;font-weight:700;letter-spacing:8px;line-height:1.2;">
                ${safeCode}
              </div>
            </div>
            <div style="height:14px;line-height:14px;font-size:1px;">&#8202;</div>
            <div style="color:${BRAND.textMuted};font-family:${FONT_BODY};font-size:13px;font-weight:400;line-height:1.6;">
              This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
            </div>
          </td>
        </tr>
      </table>`,
  });

  const text = `Kennedys Group - Verification Code

Hello ${userName},

Please use the following code to verify your email address:

${code}

This code will expire in 10 minutes. If you didn't request this code, please ignore this email.`;

  try {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!from) {
      console.warn("SMTP_FROM / SMTP_USER not set. Verification code email not sent.");
      return;
    }

    await getTransporter().sendMail({
      from,
      to: email,
      subject,
      html,
      text,
      attachments: getLogoAttachments(),
    });
    console.log(`✅ Verification code email sent to ${email}`);
  } catch (error) {
    console.error(`❌ Failed to send verification code email to ${email}:`, error);
  }
};

/** Allowed inquiryType values from kennedys-web — keep in sync with lib/contactInquiryTypes.ts */
export const CONTACT_INQUIRY_TYPE_EMAIL: Record<string, string> = {
  VILLA_RENTALS: "reservations@kennedysgroup.com",
  PROPERTY_MANAGEMENT: "partnerships@kennedysgroup.com",
  CONCIERGE: "concierge@kennedysgroup.com",
  EVENTS: "events@kennedysgroup.com",
  REAL_ESTATE: "realestate@kennedysgroup.com",
  MARKETING: "marketing@kennedysgroup.com",
};

export const CONTACT_INQUIRY_TYPES = Object.keys(CONTACT_INQUIRY_TYPE_EMAIL) as readonly string[];

export const isValidContactInquiryType = (value: unknown): value is string =>
  typeof value === "string" && CONTACT_INQUIRY_TYPES.includes(value.trim());

/**
 * Resolve internal team inbox for a contact submission.
 * Optional CONTACT_RECIPIENT forces a single destination (e.g. staging).
 */
export const resolveContactInbox = (inquiryType: string): string => {
  const override = process.env.CONTACT_RECIPIENT?.trim();
  if (override) {
    return override;
  }
  const email = CONTACT_INQUIRY_TYPE_EMAIL[inquiryType];
  if (!email) {
    throw new Error(`Unknown inquiry type: ${inquiryType}`);
  }
  return email;
};

export interface ContactFormInput {
  salutation?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
  travelDates?: string;
  requestQuote?: boolean;
  /** One of CONTACT_INQUIRY_TYPES — required on POST /contact; optional for confirmation-only uses */
  inquiryType?: string;
}

/** Send contact form submission to the inbox for the given inquiry type */
export const sendContactEmail = async (input: ContactFormInput) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    throw new Error("SMTP_FROM or SMTP_USER must be configured to send contact emails");
  }

  if (!input.inquiryType?.trim() || !isValidContactInquiryType(input.inquiryType.trim())) {
    throw new Error("Valid inquiry type is required to send contact email");
  }
  const inquiryTypeKey = input.inquiryType.trim();
  const to = resolveContactInbox(inquiryTypeKey);
  const fullName = [input.salutation, input.firstName, input.lastName].filter(Boolean).join(" ") || "Visitor";
  const inquiryLabel = inquiryTypeKey;
  const subject = `[${inquiryLabel}] Contact request – ${input.firstName} ${input.lastName} – ${input.email}`;

  const requestQuoteLabel = input.requestQuote ? "Yes" : "No";

  const details: EmailDetailItem[] = [
    { label: "Inquiry type", valueHtml: escapeHtml(inquiryLabel) },
    { label: "Name", valueHtml: escapeHtml(fullName) },
    {
      label: "Sender email",
      valueHtml: `<a href="mailto:${escapeHtml(input.email)}" style="color:${BRAND.dark};text-decoration:underline;">${escapeHtml(
        input.email
      )}</a>`,
    },
    { label: "Request a quote", valueHtml: escapeHtml(requestQuoteLabel) },
  ];
  if (input.phone?.trim()) details.push({ label: "Phone", valueHtml: escapeHtml(input.phone) });
  if (input.travelDates?.trim())
    details.push({ label: "Travel dates", valueHtml: escapeHtml(input.travelDates) });
  if (input.message?.trim())
    details.push({ label: "Message", valueHtml: escapeHtmlWithBreaks(input.message) });

  const html = buildKennedysEmailHtml({
    title: "New contact request",
    eyebrow: inquiryLabel,
    preheader: `${inquiryLabel} – ${input.firstName} ${input.lastName}`,
    leadHtml: `<p style="margin:0;">${escapeHtml(fullName)} (${escapeHtml(
      input.email
    )}) has submitted the contact form.</p>`,
    details,
  });

  const text = [
    "New contact request",
    "",
    `Inquiry type: ${inquiryLabel}`,
    `Name: ${fullName}`,
    `Sender email: ${input.email}`,
    `Request a quote: ${requestQuoteLabel}`,
    input.phone ? `Phone: ${input.phone}` : "",
    input.travelDates ? `Travel Dates: ${input.travelDates}` : "",
    input.message ? `\nMessage:\n${input.message}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await getTransporter().sendMail({
    from,
    to,
    replyTo: input.email,
    subject,
    html,
    text,
    attachments: getLogoAttachments(),
  });
};

/** Send confirmation email to the person who submitted the contact form */
export const sendContactConfirmationEmail = async (input: ContactFormInput) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  if (!from) {
    console.warn("SMTP not configured, skipping contact confirmation email");
    return;
  }

  const firstName = input.firstName || "there";
  const subject = "We received your request – Kennedys Group";

  const html = buildKennedysEmailHtml({
    title: "Thank you for reaching out",
    eyebrow: "Request received",
    preheader: "We received your request",
    leadHtml: `<p style="margin:0;">Dear ${escapeHtml(firstName)},</p>
      <div style="height:10px;line-height:10px;font-size:1px;">&#8202;</div>
      <p style="margin:0;">We have received your request and our team will get back to you shortly.</p>`,
    extraHtml: `
      <div style="color:${BRAND.textMuted};font-family:${FONT_BODY};font-size:15px;line-height:1.7;">
        <p style="margin:0;">If you have any urgent inquiries, please call us at <strong>+30 210 008 7226</strong>.</p>
        <div style="height:14px;line-height:14px;font-size:1px;">&#8202;</div>
        <p style="margin:0;">Best regards,<br/>The Kennedys Group Team</p>
      </div>`,
  });

  const text = `Kennedys Group – Request Received

Dear ${firstName},

We have received your request and our team will get back to you shortly.

If you have any urgent inquiries, please call us at +30 210 008 7226.

Best regards,
The Kennedys Group Team`;

  try {
    await getTransporter().sendMail({
      from,
      to: input.email,
      subject,
      html,
      text,
      attachments: getLogoAttachments(),
    });
    console.log(`✅ Contact confirmation email sent to ${input.email}`);
  } catch (error) {
    console.error(`❌ Failed to send contact confirmation to ${input.email}:`, error);
  }
};

/**
 * Subscribe an email to the Mailchimp newsletter (Kennedy's Group).
 * Requires MAILCHIMP_API_KEY (e.g. "xxx-us21") and MAILCHIMP_LIST_ID (audience/list id).
 * If not configured, resolves without error.
 */
export const subscribeToNewsletter = async (params: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> => {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const listId = process.env.MAILCHIMP_LIST_ID;
  if (!apiKey || !listId || !params.email?.trim()) {
    return;
  }
  const dc = apiKey.includes("-") ? apiKey.split("-")[1] : "us1";
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${listId}/members`;
  await axios.post(
    url,
    {
      email_address: params.email.trim().toLowerCase(),
      status: "subscribed",
      merge_fields: {
        FNAME: (params.firstName || "").trim() || undefined,
        LNAME: (params.lastName || "").trim() || undefined,
      },
    },
    {
      headers: {
        Authorization: `apikey ${apiKey}`,
        "Content-Type": "application/json",
      },
      validateStatus: (status) => status === 200 || status === 400, // 400 = already subscribed
    }
  );
};
