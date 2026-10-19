// Edit these before launch. Empty social links are hidden automatically.
export const links = {
  appStore: "", // e.g. https://apps.apple.com/app/payblocx/id0000000000
  googlePlay: "", // e.g. https://play.google.com/store/apps/details?id=com.dreamsoftwarestudios.payblocx.payblocx
  supportEmail: "mailto:support@payblocx.com",
  terms: "/terms/",
  privacy: "/privacy/",
  instagram: "",
  x: "",
  tiktok: "",
  linkedin: "",
  // Optional extra contact channels; hidden on the contact page while empty.
  whatsapp: "", // e.g. https://wa.me/2348000000000
  // POST { channel, phone?, country?, email?, source } here to collect waitlist sign-ups.
  // Leave empty to fall back to a pre-filled email to support.
  waitlistEndpoint: "",
  // POST { email } here to collect newsletter sign-ups. Leave empty to fall back to an email to support.
  newsletterEndpoint: "",
  // POST { name, email, phone, topic, message, source } here for the contact form.
  // Leave empty to fall back to a pre-filled email to support.
  contactEndpoint: "",
  // POST { name, email, phone, tag, reason, source } here for /delete-account/ requests.
  // Leave empty to fall back to a pre-filled email to support.
  deleteAccountEndpoint: "",
};
