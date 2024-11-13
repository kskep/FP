import { client } from '$lib/sanity';

export async function load() {
    const members = await client.fetch(`
        *[_type == "member"] {
            _id,
            name,
            rank,
            "wishlist": *[_type == "wishlistItem" && references(^._id)] {
                _id,
                name,
                source,
                status,
                notes
            } | order(status asc)
        } | order(name asc)
    `);

    return {
        members
    };
}
