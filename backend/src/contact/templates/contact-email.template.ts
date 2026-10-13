import { ContactCategory } from '../dto/contact.dto.js';

export interface ContactEmailContent {
  name: string;
  email: string;
  category: ContactCategory;
  subject: string;
  message: string;
  orderReference?: string;
  submittedAt: Date;
}

/** Escapes user-supplied text before it is interpolated into the HTML email. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Collapses newlines into <br /> after escaping, preserving paragraphs. */
function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, '<br />');
}

/**
 * Operator-facing notification for a submitted contact form. The visitor's
 * address is echoed so the operator can verify it; replying is handled through
 * the message `replyTo`, set by the mail service.
 */
export function contactEmailTemplate(content: ContactEmailContent): string {
  const name = escapeHtml(content.name);
  const email = escapeHtml(content.email);
  const category = escapeHtml(content.category);
  const subject = escapeHtml(content.subject);
  const message = escapeMultiline(content.message);
  const orderReference = content.orderReference
    ? escapeHtml(content.orderReference)
    : undefined;
  const submittedAt = escapeHtml(content.submittedAt.toISOString());

  const orderRow = orderReference
    ? `<tr>
                  <td style="padding:6px 0;font-size:14px;color:#6b7280;width:140px;vertical-align:top;">Order reference</td>
                  <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;">${orderReference}</td>
                </tr>`
    : '';

  const orderBlock = orderReference
    ? `\n                <tr>
                  <td style="padding:8px 32px 0;">
                    <p style="margin:0;font-size:13px;color:#6b7280;">Order reference</p>
                    <p style="margin:2px 0 0;font-size:15px;color:#111827;font-weight:600;">${orderReference}</p>
                  </td>
                </tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New contact message</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding:28px 32px 4px;">
                <p style="margin:0;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#9ca3af;">VeloceMart</p>
                <h1 style="margin:6px 0 0;font-size:20px;line-height:1.3;color:#111827;">New contact form submission</h1>
              </td>
            </tr>
            ${orderBlock}
            <tr>
              <td style="padding:20px 32px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#6b7280;width:140px;vertical-align:top;">From</td>
                    <td style="padding:6px 0;font-size:14px;color:#111827;font-weight:600;">${name} &lt;${email}&gt;</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#6b7280;vertical-align:top;">Category</td>
                    <td style="padding:6px 0;font-size:14px;color:#111827;">${category}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-size:14px;color:#6b7280;vertical-align:top;">Subject</td>
                    <td style="padding:6px 0;font-size:14px;color:#111827;">${subject}</td>
                  </tr>
                  ${orderRow}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 0;">
                <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Message</p>
                <div style="padding:16px;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;font-size:14px;line-height:1.6;color:#111827;">
                  ${message}
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px 32px;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#9ca3af;">
                  Submitted ${submittedAt}. Reply to this email to respond directly to ${name}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
