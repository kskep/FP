import { createClient } from '@sanity/client'
import { PUBLIC_SANITY_PROJECT_ID } from '$env/static/public'
import { SANITY_TOKEN } from '$env/static/private'

export const client = createClient({
    projectId: PUBLIC_SANITY_PROJECT_ID,
    dataset: 'production',
    useCdn: false,
    apiVersion: '2024-11-09',
    token: SANITY_TOKEN
});
