import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        const { memberId, item } = await request.json();

        const result = await client.create({
            _type: 'wishlistItem',
            name: item.name,
            source: item.source,
            status: item.status,
            notes: item.notes,
            member: {
                _type: 'reference',
                _ref: memberId
            }
        });

        return json(result);
    } catch (err) {
        console.error('Error creating wishlist item:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error creating wishlist item'
        }), {
            status: 500
        });
    }
}
