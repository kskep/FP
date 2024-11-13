import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    try {
        const member = await request.json();

        const doc = {
            _type: 'member',
            name: member.name,
            rank: member.rank,
            dkp: parseInt(member.dkp) || 0
        };

        console.log('Creating member:', doc);
        const result = await client.create(doc);
        console.log('Member created:', result);

        return json(result);

    } catch (err) {
        console.error('Error creating member:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error creating member'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
