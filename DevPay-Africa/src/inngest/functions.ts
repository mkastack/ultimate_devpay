import { inngest } from "./client";
import { supabaseServer as supabase } from "@/integrations/supabase/server";
import { sendJobAlertEmail } from "@/integrations/resend";
import { captureException } from "@/integrations/sentry";

// Background function: Match and notify developers when a new job is posted
export const notifyMatchingDevelopers = inngest.createFunction(
  { id: "notify-matching-developers", name: "Notify Developers on Matching Job Post" },
  { event: "job/posted" },
  async ({ event, step }) => {
    try {
      const { jobId, title, description, skills } = event.data;

      // Step 1: Query developers from developer_profiles
      const developers = await step.run("fetch-all-developers", async () => {
        const { data } = await supabase
          .from("developer_profiles")
          .select("user_id, skills, title, profile:profiles(full_name, email)");
        return data ?? [];
      });

      // Step 2: Filter matching developers based on skill sets or title keywords
      const matchingDevelopers = await step.run("match-developer-skills", async () => {
        const jobSkillsLower = (skills as string[]).map(s => s.toLowerCase());
        const jobTitleLower = title.toLowerCase();

        return developers.filter(dev => {
          const devSkills = (dev.skills ?? []).map(s => s.toLowerCase());
          const skillMatch = devSkills.some(s => jobSkillsLower.includes(s));

          const devTitle = (dev.title ?? "").toLowerCase();
          const titleKeywords = jobTitleLower.split(" ");
          const titleMatch = titleKeywords.some(word => word.length > 3 && devTitle.includes(word));

          return skillMatch || titleMatch;
        });
      });

      // Step 3: Send background notifications and trigger Resend email alerts
      const notifications = await step.run("dispatch-notifications", async () => {
        const results = [];
        for (const dev of matchingDevelopers) {
          try {
            const { error } = await supabase.from("notifications").insert({
              user_id: dev.user_id,
              type: "job_match",
              title: "New Job Match Alert! 🚀",
              message: `A new job matching your skill set was posted: "${title}". View details and submit a proposal!`,
              link: `/jobs/${jobId}`
            });

            if (dev.profile?.email) {
              await sendJobAlertEmail(
                dev.profile.email,
                dev.profile.full_name || "Developer",
                title,
                jobId
              );
            }

            results.push({ devId: dev.user_id, status: error ? "failed" : "success" });
          } catch (e) {
            captureException(e, {
              userId: dev.user_id,
              tags: { subtask: "email-dispatch", jobId }
            });
            results.push({ devId: dev.user_id, status: "error" });
          }
        }
        return results;
      });

      return {
        message: `Successfully processed background notifications for ${matchingDevelopers.length} developers.`,
        notifications
      };
    } catch (error) {
      captureException(error, {
        tags: { workflow: "notifyMatchingDevelopers", jobId: event.data?.jobId }
      });
      throw error;
    }
  }
);

// Send a welcome email when a new user signs up
export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email" },
  { event: "user/signed.up" },
  async ({ event, step }) => {
    const { email, name, role } = event.data;

    await step.run("send-email", async () => {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "hello@devpayafrica.com",
          to: email,
          subject: `Welcome to DevPay Africa, ${name}! 🇬🇭`,
          html: `
            <h1>Welcome ${name}!</h1>
            <p>Your ${role} account is ready.</p>
            <a href="https://devpayafrica.com/dashboard">
              Go to your dashboard
            </a>
          `,
        }),
      });
    });

    return { success: true };
  }
);

// Notify a developer when an escrow payment is released
export const notifyPaymentReleased = inngest.createFunction(
  { id: "notify-payment-released" },
  { event: "payment/released" },
  async ({ event, step }) => {
    const { developer_email, developer_name, amount } = event.data;

    await step.run("send-payment-email", async () => {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "noreply@devpayafrica.com",
          to: developer_email,
          subject: `💰 GHS ${amount} added to your wallet`,
          html: `
            <h1>Payment received, ${developer_name}!</h1>
            <p>GHS ${amount} has been added to your DevPay wallet.</p>
            <a href="https://devpayafrica.com/dashboard/wallet">
              Go to your wallet
            </a>
          `,
        }),
      });
    });
  }
);
