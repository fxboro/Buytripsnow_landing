/**
 * BuyTripsNow — Notification Helper
 *
 * Handles server-side delivery of alerts (e.g. Slack webhook alerts,
 * WhatsApp mock logs, email fallbacks). Used by both API route handlers
 * and server actions.
 */

interface SlackNotificationPayload {
  leadName: string;
  leadEmail: string;
  leadPhone: string;
  selectedPackage: string;
  numAdults: number;
  numChildren: number;
  departureDate: string;
  departureCity?: string;
  conciergeName: string;
  conciergeEmail: string;
}

/**
 * Formats and posts a notification message to the configured Slack channel.
 * Falls back to standard console logging if no webhook URL is defined.
 */
export async function sendSlackLeadNotification(payload: SlackNotificationPayload): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  const headerText = `🆕 New Lead Assigned to ${payload.conciergeName}!`;
  const summaryText = `*Lead Name:* ${payload.leadName}\n*Package:* ${payload.selectedPackage}\n*Departure:* ${payload.departureDate} (${payload.departureCity || 'Not specified'})\n*Group size:* ${payload.numAdults} Adults, ${payload.numChildren} Children`;

  // Format using Slack Block Kit for premium presentation in Slack
  const slackBlocks = {
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: headerText,
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: summaryText,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Email:*\n${payload.leadEmail}`,
          },
          {
            type: "mrkdwn",
            text: `*Phone / WA:*\n${payload.leadPhone}`,
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Assigned Concierge Email: ${payload.conciergeEmail} | Source: Germany 2026 Landing Page`,
          },
        ],
      },
    ],
  };

  if (!webhookUrl) {
    console.log("🔔 [Notification System Mock] Slack webhook url is not set. Printout payload:");
    console.dir(slackBlocks, { depth: null });
    return true;
  }

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slackBlocks),
    });

    if (!res.ok) {
      console.error(`Failed to send Slack webhook notification. Status: ${res.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error sending Slack webhook notification:", error);
    return false;
  }
}
