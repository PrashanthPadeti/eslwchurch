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
      name: 'activities',
      title: 'Also on this week',
      type: 'array',
      description:
        'Anything else happening during the week — prayer meetings, youth night, fellowship. Leave empty if there is nothing on.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'activity',
          fields: [
            defineField({
              name: 'weekday',
              title: 'Day',
              type: 'number',
              options: {
                list: [
                  { title: 'Sunday', value: 0 },
                  { title: 'Monday', value: 1 },
                  { title: 'Tuesday', value: 2 },
                  { title: 'Wednesday', value: 3 },
                  { title: 'Thursday', value: 4 },
                  { title: 'Friday', value: 5 },
                  { title: 'Saturday', value: 6 },
                ],
                layout: 'dropdown',
              },
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'time',
              title: 'Time',
              type: 'string',
              description: 'Optional. 24-hour, like 19:00.',
            }),
            defineField({
              name: 'activity',
              title: 'What it is',
              type: 'string',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'venue',
              title: 'Where',
              type: 'string',
              description: 'Leave blank to leave it unsaid.',
            }),
            defineField({ name: 'notes', title: 'Extra detail', type: 'text', rows: 2 }),
          ],
          preview: {
            select: { title: 'activity', weekday: 'weekday', time: 'time' },
            prepare: ({ title, weekday, time }) => {
              const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
              const day = typeof weekday === 'number' ? days[weekday] : '';
              return { title, subtitle: [day, time].filter(Boolean).join(' · ') };
            },
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

// ------------------------------------------------------------- living word

const livingWord = defineType({
  name: 'livingWord',
  title: 'Living Word',
  type: 'document',
  description: 'The message published on the website each week for the church to read.',
  fields: [
    defineField({
      name: 'title',
      title: 'Title of this week’s message',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Web address',
      type: 'slug',
      options: { source: 'title', maxLength: 80 },
      description:
        'Click Generate. This becomes the link for this message, so it can be shared on its own.',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish on',
      type: 'date',
      options: { dateFormat: 'ddd D MMM YYYY' },
      description:
        'Dated in the future? It stays hidden until that day, so you can write ahead.',
      initialValue: () => new Date().toISOString().slice(0, 10),
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'passage',
      title: 'Bible passage',
      type: 'string',
      description: 'For example "Romans 5:1-11". Shown as a badge under the title.',
    }),
    defineField({
      name: 'series',
      title: 'Part of a series',
      type: 'string',
      description: 'Optional. For example "Journey Through Romans".',
    }),
    defineField({
      name: 'author',
      title: 'Written by',
      type: 'string',
      initialValue: 'Pastor Daniel',
    }),
    defineField({
      name: 'summary',
      title: 'Short summary',
      type: 'text',
      rows: 3,
      description:
        'One or two sentences, shown in larger type above the message and used as the preview when the link is shared.',
    }),
    defineField({
      name: 'body',
      title: 'The message',
      type: 'array',
      description:
        'Write the message here. Use Normal for paragraphs, Heading for section titles, and Quote for scripture you want set apart.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading', value: 'h2' },
            { title: 'Sub-heading', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullets', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  { name: 'href', type: 'url', title: 'Address' },
                ],
              },
            ],
          },
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'attachment',
      title: 'Notes to download (PDF)',
      type: 'file',
      description: 'Optional. Adds a download button.',
      options: { accept: '.pdf' },
    }),
  ],
  orderings: [
    { name: 'publishDesc', title: 'Newest first', by: [{ field: 'publishDate', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'title', date: 'publishDate', passage: 'passage' },
    prepare: ({ title, date, passage }) => ({
      title,
      subtitle: [date, passage].filter(Boolean).join(' · '),
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

export const schemaTypes = [weeklyProgram, livingWord, event, announcement];
