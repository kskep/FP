// src/routes/+page.server.js
import { client } from '$lib/sanity';

export async function load() {
    const members = await client.fetch(`
        *[_type == "member"] {
            _id,
            name,
            rank,
            dkp,
            "wishlist": *[_type == "wishlistItem" && references(^._id)] {
                _id,
                name,
                status,
                notes
            }
        }
    `);

    return {
        members
    };
}
