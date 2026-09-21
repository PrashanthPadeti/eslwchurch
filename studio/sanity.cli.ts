import { defineCliConfig } from 'sanity/cli';

/** Public identifier for the church's Sanity project. Not a credential —
 *  it is embedded in the published JavaScript of both the studio and the
 *  website, so it is safe in version control. */
const PROJECT_ID = '11d81mar';

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_DATASET || 'production',
  },
  // Published at https://eslwchurch.sanity.studio
  studioHost: 'eslwchurch',
});
