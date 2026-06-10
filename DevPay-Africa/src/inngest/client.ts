import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "devpay-africa",
  eventKey: import.meta.env.VITE_INNGEST_EVENT_KEY,
});
