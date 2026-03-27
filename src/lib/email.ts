import { Resend } from "resend";
import { siteConfig } from "@/config/site";

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Missing RESEND_API_KEY");
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendDownloadEmail(params: {
  to: string;
  bundleTitle: string;
  bundleSlug: string;
  downloadToken: string;
}) {
  const downloadUrl = `${siteConfig.url}/bundles/${params.bundleSlug}/download?token=${params.downloadToken}`;

  const resend = getResend();
  await resend.emails.send({
    from: `JK Aspirant <noreply@${new URL(siteConfig.url).hostname}>`,
    to: params.to,
    subject: `Your download is ready — ${params.bundleTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto;">
        <h2>Your download is ready!</h2>
        <p>Thank you for purchasing <strong>${params.bundleTitle}</strong>.</p>
        <p>
          <a href="${downloadUrl}" style="display: inline-block; background: #0d9488; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
            Download Now
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 48 hours. If you need help, contact us on
          <a href="https://t.me/jkaspirant">Telegram</a>.
        </p>
        <p style="color: #999; font-size: 12px;">&mdash; JK Aspirant</p>
      </div>
    `,
  });
}
