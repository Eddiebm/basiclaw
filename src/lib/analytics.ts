"use client";

import posthog from "posthog-js";

export type VoiceAnalyticsSurface = "chat" | "audit" | "constitution" | "questions" | "topics" | "compare";

export type AnalyticsEvent =
  | "hero_ask_prefill_submit"
  | "home_view"
  | "constitution_viewed"
  | "country_selected"
  | "chat_message_sent"
  | "audit_started"
  | "audit_completed"
  | "audit_shared"
  | "demand_letter_paywall"
  | "pricing_viewed"
  | "checkout_started"
  | "checkout_completed"
  | "faq_expanded"
  | "topic_page_viewed"
  | "us_state_topic_viewed"
  | "comparison_viewed"
  | "lawyer_cta_clicked"
  | "lawyer_application_submitted"
  | "verified_lawyer_clicked"
  | "question_viewed"
  | "question_to_chat"
  | "voice_listen_started"
  | "voice_listen_stopped"
  | "tts_started"
  | "tts_stopped"
  | "tts_error"
  | "index_viewed"
  | "index_filter_applied"
  | "form_submit_success"
  | "form_submit_error";

let initialised = false;

export function initAnalytics(): boolean {
  if (typeof window === "undefined") return false;
  if (initialised) return true;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return false;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
  posthog.init(key, {
    api_host: host,
    person_profiles: "always",
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    loaded: (instance) => {
      if (process.env.NODE_ENV === "development") instance.debug();
    },
  });
  initialised = true;
  return true;
}

export function track(event: AnalyticsEvent, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  if (!initialised) {
    const ok = initAnalytics();
    if (!ok) return;
  }
  posthog.capture(event, properties);
}

export function identify(distinctId: string, properties?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !initialised) return;
  posthog.identify(distinctId, properties);
}
