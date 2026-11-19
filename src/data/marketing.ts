// Marketing tracking and HubSpot form settings for amerischools.org.
//
// Paste the IDs AmeriSchools Marketing provides into the empty strings below.
// Anything left blank is simply not loaded, so the site works before the IDs arrive.
//
// These IDs are AmeriSchools-only. Do NOT reuse Capstone Quest Academy's GA4 property,
// Meta Pixel, Ads account or HubSpot portal here: the two brands' tracking stays separate.
// (No cross-domain linking to capstonequestacademy.com is configured, on purpose.)

export type FormKind = 'tour' | 'inquiry';

export const tracking = {
  /** GA4 Measurement ID, e.g. "G-ABC123XYZ". */
  ga4Id: '',
  /** Meta (Facebook/Instagram) Pixel ID, e.g. "1234567890123456". */
  metaPixelId: '',
  googleAds: {
    /** Google Ads conversion ID, e.g. "AW-123456789". */
    id: '',
    /** Conversion labels from Google Ads (the part after the slash in "AW-123/AbCdEf"). Blank = not sent. */
    conversions: {
      tour_request: '',
      inquiry_submit: '',
      enroll_click: '',
      phone_click: '',
    },
  },
  hubspot: {
    /** HubSpot portal (Hub) ID. Also loads the HubSpot tracking code on every page. */
    portalId: '',
    /** Data region from the HubSpot embed code ("na1", "na2", "eu1"). */
    region: 'na1',
    forms: {
      /** "Request a tour" form ID. */
      tour: '',
      /** Inquiry / student interest form ID. */
      inquiry: '',
    },
    /**
     * Internal name of the HubSpot field that holds the campus (a dropdown or hidden field).
     * On campus pages it is pre-filled so leads arrive tagged with the right campus.
     */
    campusField: 'campus',
    /** Value written to that field for each campus slug (must match the HubSpot dropdown options). */
    campusValues: {
      tucson: 'Tucson',
      'yuma-north': 'Yuma North',
      'yuma-middle': 'Yuma Middle',
    } as Record<string, string>,
  },
};

/** Events the site sends (GA4 event name → what triggers it). Shared with the testing report. */
export const trackedEvents = {
  tour_request: 'Tour request form submitted (HubSpot)',
  inquiry_submit: 'Inquiry / student interest form submitted (HubSpot)',
  enroll_click: 'Click on an Apply / Enroll link or the registration packet',
  phone_click: 'Click on any phone number (tel: link)',
  tour_cta_click: 'Click on a "Request a tour" button (before the form)',
} as const;
