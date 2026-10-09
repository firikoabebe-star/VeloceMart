export function otpEmailTemplate(code: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verify your VeloceMart account</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding:32px 40px 8px;text-align:center;">
                <h1 style="margin:0;font-size:22px;line-height:1.3;color:#111827;">Verify your email</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 40px 0;text-align:center;">
                <p style="margin:0;font-size:15px;line-height:1.6;color:#4b5563;">
                  Use the code below to confirm your VeloceMart account.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px;text-align:center;">
                <div style="display:inline-block;padding:16px 32px;background-color:#f4f4f5;border-radius:10px;border:1px solid #e5e7eb;">
                  <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#111827;font-family:'Courier New',Courier,monospace;">${code}</span>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 40px 32px;text-align:center;">
                <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">
                  This code expires in <strong>10 minutes</strong>.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 40px 32px;border-top:1px solid #f0f0f1;text-align:center;">
                <p style="margin:0;font-size:13px;line-height:1.6;color:#9ca3af;">
                  If you didn't create a VeloceMart account, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">&copy; VeloceMart</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}
