import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLAN_MAP: Record<string, { plan: string; limit: number }> = {
  "price_1TCy4hKTwW79ip00MhitTcY8": { plan: "pro", limit: 30 },
  "price_1TCy4iKTwW79ip00yNVhNgly": { plan: "business", limit: 100 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
  const signature = req.headers.get("stripe-signature");

  // If no signature, this might be called without webhook secret - handle gracefully
  let event: Stripe.Event;
  const body = await req.text();

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400, headers: corsHeaders });
    }
  } else {
    // For development without webhook secret
    event = JSON.parse(body);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        if (!userId || !session.subscription) break;

        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const priceId = subscription.items.data[0]?.price?.id;
        const planInfo = priceId ? PLAN_MAP[priceId] : null;

        if (planInfo) {
          await supabase
            .from("subscriptions")
            .update({
              plan: planInfo.plan,
              prompts_limit: planInfo.limit,
              prompts_used: 0,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const userId = customer.metadata?.supabase_user_id;
        if (!userId) break;

        const priceId = subscription.items.data[0]?.price?.id;
        const planInfo = priceId ? PLAN_MAP[priceId] : null;

        if (planInfo) {
          await supabase
            .from("subscriptions")
            .update({
              plan: planInfo.plan,
              prompts_limit: planInfo.limit,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
        const userId = customer.metadata?.supabase_user_id;
        if (!userId) break;

        await supabase
          .from("subscriptions")
          .update({ plan: "free", prompts_limit: 3, prompts_used: 0 })
          .eq("user_id", userId);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Webhook error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
