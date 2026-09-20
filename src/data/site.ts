/**
 * Single source of truth for church details.
 * Everything here appears in multiple places across the site — change it once.
 *
 * Fields marked TODO are awaiting information from the church.
 */

export type Service = {
  /** 0 = Sunday … 6 = Saturday */
  weekday: number;
  /** Wall-clock local time, "HH:MM". Never an absolute instant — see lib/datetime.ts */
  start: string;
  end: string;
  name: string;
  venue: string;
  description?: string;
  /** Spoken languages, in the order they are given. Drives the display label
   *  and the inLanguage field in the Church structured data. */
  languages?: { label: string; bcp47: string }[];
};

/** "Telugu & English" — Australian style uses an ampersand in this position. */
export function languageLabel(s: Service): string | null {
  if (!s.languages?.length) return null;
  const names = s.languages.map((l) => l.label);
  if (names.length === 1) return names[0];
  return names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
}

export const site = {
  name: 'El Shaddai Living Waters Church',
  shortName: 'El Shaddai Living Waters',
  initials: 'ESLW',
  tagline: 'A Christ-Centred, Spirit-Filled Church',
  locationLine: 'Sydney, Australia',
  domain: 'eslwchurch.com',
  url: 'https://eslwchurch.com',

  description:
    'A Christ-centred, Spirit-filled church in Whalan, Western Sydney. Come as you are, encounter Jesus, grow in His Word, and experience the presence and power of the Holy Spirit.',

  address: {
    street: '244 Woodstock Avenue',
    suburb: 'Whalan',
    state: 'NSW',
    postcode: '2770',
    country: 'Australia',
    get full() {
      return `${this.street}, ${this.suburb} ${this.state} ${this.postcode}`;
    },
  },

  mapsLink: 'https://maps.app.goo.gl/ZcMm84XB9mo7aGig8',
  mapsEmbed:
    'https://www.google.com/maps?q=244+Woodstock+Avenue+Whalan+NSW+2770&output=embed',

  timezone: 'Australia/Sydney',
  locale: 'en-AU',

  services: [
    {
      weekday: 0,
      start: '10:00',
      end: '12:00',
      name: 'Sunday Worship Service',
      venue: '244 Woodstock Avenue, Whalan',
      languages: [
        { label: 'Telugu', bcp47: 'te' },
        { label: 'English', bcp47: 'en-AU' },
      ],
      description:
        'A multi-language service in Telugu and English. Worship, the Word of God, and prayer. Everyone is welcome — come as you are.',
    },
  ] satisfies Service[],

  pastor: {
    name: 'Pastor Daniel',
    role: 'Founder and Senior Pastor',
    // TODO: photo and 100–150 word bio awaiting church
    photo: null as string | null,
    bio: null as string | null,
  },

  contact: {
    // Public enquiries address. This is the ONLY address that appears on the
    // site — the administrator account used for the domain, hosting and repo is
    // deliberately kept off the public pages.
    //
    // Next step: once Cloudflare Email Routing is configured, change this to
    // info@eslwchurch.com and forward that to the mailbox below. Editing this
    // one line updates the footer, the Visit page, the privacy policy and the
    // search-engine structured data together.
    email: 'eslwchurch@gmail.com' as string | null,
    // TODO: awaiting church — whether a phone number should be public
    phone: null as string | null,
  },

  social: {
    facebook: null as string | null,
    instagram: null as string | null,
    youtube: null as string | null,
  },

  // TODO: awaiting church — required for .org.au and for the Give page
  abn: null as string | null,
  acnc: null as string | null,

  giving: {
    accountName: null as string | null,
    bsb: null as string | null,
    accountNumber: null as string | null,
    payId: null as string | null,
    taxNote: null as string | null,
  },
};

export type Site = typeof site;
