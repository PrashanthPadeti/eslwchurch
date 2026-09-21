import { defineType, defineField, defineArrayMember } from 'sanity';

/**
 * Content model for El Shaddai Living Waters Church.
 *
 * Written for volunteers, not developers. Every field has a plain-English
 * title and a description that says what it does and where it appears, because
 * the person editing this will not have read any documentation.
 *
 * Field names here must match the GROQ queries in src/lib/content.ts.
 */

// ------------------------------------------------------- weekly programme

const weeklyProgram = defineType({
  name: 'weeklyProgram',
  title: 'Weekly Program',
  type: 'document',
  fields: [
    defineField({
      name: 'weekOf',
      title: 'Which Sunday is this for?',
      type: 'date',
      options: { dateFormat: 'ddd D MMM YYYY' },
      description:
        'Pick the date of the Sunday. You can prepare next week in advance — it only appears on the website when its week arrives.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'theme',
      title: 'Theme for the week',
      type: 'string',
      description: 'Optional. A short phrase, shown as the big heading. For example "Living Water".',
    }),
    defineField({
      name: 'sermonTitle',
      title: 'Message title',
      type: 'string',
    }),
    defineField({
      name: 'preacher',
      title: 'Who is speaking',
      type: 'string',
      initialValue: 'Pastor Daniel',
    }),
    defineField({
      name: 'scriptureReading',
      title: 'Bible reading',
      type: 'string',
      description: 'For example "John 7:37-39".',
    }),
    defineField({
      name: 'worshipLeader',
      title: 'Worship led by',
      type: 'string',
    }),
    defineField({
      name: 'communion',
      title: 'Holy Communion this Sunday',
      type: 'boolean',
      description: 'Tick this and a Communion note appears on the page.',
      initialValue: false,
    }),
    defineField({
      name: 'items',
      title: 'Order of service',
      type: 'array',
      description: 'The running order for the morning. Drag to reorder.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'item',
          fields: [
            defineField({
              name: 'time',
              title: 'Time',
              type: 'string',
              description: 'Optional. 24-hour, like 10:00 or 14:30. Leave blank if there is no set time.',
              validation: (r) =>
                r.regex(/^([01]\d|2[0-3]):[0-5]\d$/, {
                  name: '24-hour time',
                  invert: false,
                }).warning('Use 24-hour time such as 10:00 or 14:30.'),
            }),
            defineField({
              name: 'activity',
              title: 'What happens',
              type: 'string',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'person',
              title: 'Who is leading it',
              type: 'string',
            }),
          ],
          preview: {
            select: { title: 'activity', subtitle: 'person', time: 'time' },
            prepare: ({ title, subtitle, time }) => ({
              title: time ? `${time} — ${title}` : title,
              subtitle,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'notes',
      title: 'Note for the congregation',
      type: 'text',
      rows: 3,
      description: 'Optional. Shown in a highlighted box at the bottom of the page.',
    }),
  ],
  orderings: [
    { name: 'weekDesc', title: 'Newest Sunday first', by: [{ field: 'weekOf', direction: 'desc' }] },
  ],
  preview: {
    select: { weekOf: 'weekOf', theme: 'theme', sermon: 'sermonTitle' },
    prepare: ({ weekOf, theme, sermon }) => ({
      title: weekOf ? `Sunday ${weekOf}` : 'No date set',
      subtitle: theme || sermon || 'No theme yet',
    }),
  },
});

// ------------------------------------------------------------ bible study

const bibleStudy = defineType({
  name: 'bibleStudy',
  title: 'Bible Study',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Study title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      options: { source: 'title', maxLength: 80 },
      description: 'Click Generate. This is only used behind the scenes.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date and start time',
      type: 'datetime',
      options: { dateFormat: 'ddd D MMM YYYY', timeFormat: 'h:mm a', timeStep: 15 },
      description: 'Enter the Sydney time. Daylight saving is handled automatically.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'endDate',
      title: 'Finish time',
      type: 'datetime',
      options: { dateFormat: 'ddd D MMM YYYY', timeFormat: 'h:mm a', timeStep: 15 },
      description: 'Optional. The study stays listed as upcoming until this passes.',
    }),
    defineField({
      name: 'series',
      title: 'Part of a series',
      type: 'string',
      description: 'Optional. For example "Journey Through Romans".',
    }),
    defineField({
      name: 'passage',
      title: 'Bible passage',
      type: 'string',
      description: 'For example "Romans 5:1-11".',
    }),
    defineField({ name: 'leader', title: 'Led by', type: 'string' }),
    defineField({
      name: 'description',
      title: 'What this study covers',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'venue',
      title: 'Where',
      type: 'string',
      description: 'Leave blank to use the church address.',
    }),
    defineField({
      name: 'onlineLink',
      title: 'Online meeting link',
      type: 'url',
      description: 'Optional. Zoom, Meet or similar. Adds a "Join online" button.',
    }),
    defineField({
      name: 'notes',
      title: 'Study notes (PDF)',
      type: 'file',
      description: 'Optional. Adds a download button.',
      options: { accept: '.pdf' },
    }),
  ],
  orderings: [
    { name: 'dateDesc', title: 'Newest first', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', date: 'date', passage: 'passage' },
    prepare: ({ title, date, passage }) => ({
      title,
      subtitle: [date ? new Date(date).toDateString() : null, passage]
        .filter(Boolean)
        .join(' · '),
    }),
  },
});

// ------------------------------------------------------------------ event

const event = defineType({
  name: 'event',
  title: 'Program / Event',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Event name', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      options: { source: 'title', maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'category',
      title: 'Type of event',
      type: 'string',
      options: {
        list: [
          'Convention', 'Fellowship', 'Outreach', 'Youth', 'Retreat',
          'Special Service', 'Prayer', 'Children', 'Women', 'Men',
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'startDateTime',
      title: 'Starts',
      type: 'datetime',
      options: { dateFormat: 'ddd D MMM YYYY', timeFormat: 'h:mm a', timeStep: 15 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'endDateTime',
      title: 'Ends',
      type: 'datetime',
      options: { dateFormat: 'ddd D MMM YYYY', timeFormat: 'h:mm a', timeStep: 15 },
    }),
    defineField({ name: 'venue', title: 'Where', type: 'string' }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'featured',
      title: 'Highlight on the homepage',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({ name: 'registrationLink', title: 'Registration link', type: 'url' }),
    defineField({ name: 'contactPerson', title: 'Who to contact', type: 'string' }),
  ],
  orderings: [
    { name: 'startDesc', title: 'Soonest first', by: [{ field: 'startDateTime', direction: 'asc' }] },
  ],
  preview: {
    select: { title: 'title', date: 'startDateTime', category: 'category' },
    prepare: ({ title, date, category }) => ({
      title,
      subtitle: [date ? new Date(date).toDateString() : null, category].filter(Boolean).join(' · '),
    }),
  },
});

// ----------------------------------------------------------- announcement

const announcement = defineType({
  name: 'announcement',
  title: 'Announcement',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Notice', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'body',
      title: 'Details',
      type: 'text',
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publishDate',
      title: 'Show from',
      type: 'date',
      options: { dateFormat: 'ddd D MMM YYYY' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'expiryDate',
      title: 'Hide after',
      type: 'date',
      options: { dateFormat: 'ddd D MMM YYYY' },
      description:
        'Strongly recommended. The notice removes itself from the website after this date, so nobody has to remember to delete it.',
    }),
    defineField({
      name: 'priority',
      title: 'Importance',
      type: 'string',
      options: {
        list: [
          { title: 'Normal', value: 'normal' },
          { title: 'Important — highlighted', value: 'high' },
        ],
        layout: 'radio',
      },
      initialValue: 'normal',
    }),
  ],
  preview: {
    select: { title: 'title', expiry: 'expiryDate', priority: 'priority' },
    prepare: ({ title, expiry, priority }) => ({
      title: priority === 'high' ? `★ ${title}` : title,
      subtitle: expiry ? `Hides after ${expiry}` : 'No expiry set',
    }),
  },
});

export const schemaTypes = [weeklyProgram, bibleStudy, event, announcement];
