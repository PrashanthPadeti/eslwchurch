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
};

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
      description:
        'Worship, the Word of God, and prayer. Everyone is welcome — come as you are.',
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
    // Interim address. Once the domain is live, set up Cloudflare Email Routing
    // to forward info@eslwchurch.com here and change this one line — the
    // footer, Visit page, privacy policy and structured data all follow.
    email: 'p.noblebose@gmail.com' as string | null,
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
