import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas';

/**
 * Sanity Studio — the admin area for El Shaddai Living Waters Church.
 *
 * Published at https://eslwchurch.sanity.studio. Administrators sign in with
 * the church Google account; nobody who has not been invited can see or edit
 * anything. Nothing here is served from the public website, so the site itself
 * stays fully static with no login page and no admin surface to attack.
 *
 * The sidebar below is ordered by how often each thing is actually edited —
 * the weekly items first, the occasional ones after — rather than
 * alphabetically, which is what the default would give.
 */
export default defineConfig({
  name: 'eslwchurch',
  title: 'El Shaddai Living Waters Church',

  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET || 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Church Website')
          .items([
            S.listItem()
              .title('Weekly Program')
              .child(
                S.documentTypeList('weeklyProgram')
                  .title('Weekly Program')
                  .defaultOrdering([{ field: 'weekOf', direction: 'desc' }]),
              ),
            S.listItem()
              .title('Living Word')
              .child(
                S.documentTypeList('livingWord')
                  .title('Living Word')
                  .defaultOrdering([{ field: 'publishDate', direction: 'desc' }]),
              ),
            S.divider(),
            S.listItem()
              .title('Programs & Events')
              .child(
                S.documentTypeList('event')
                  .title('Programs & Events')
                  .defaultOrdering([{ field: 'startDateTime', direction: 'asc' }]),
              ),
            S.listItem()
              .title('Announcements')
              .child(
                S.documentTypeList('announcement')
                  .title('Announcements')
                  .defaultOrdering([{ field: 'publishDate', direction: 'desc' }]),
              ),
          ]),
    }),
    visionTool(),
  ],

  schema: { types: schemaTypes },
});
