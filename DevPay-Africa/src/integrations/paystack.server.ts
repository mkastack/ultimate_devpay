import { createServerFn } from "@tanstack/react-start";

const PAYSTACK_API_BASE = "https://api.paystack.co";
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY ?? "";

export const verifyPaystackPaymentFn = createServerFn({ method: "GET" })
  .inputValidator((data: { reference: string }) => data)
  .handler(async ({ data }) => {
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error(
        "Paystack secret key is not configured. Cannot verify payment."
      );
    }

    const response = await fetch(
      `${PAYSTACK_API_BASE}/transaction/verify/${data.reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Paystack API error: ${response.statusText}`);
    }

    return response.json();
  });
