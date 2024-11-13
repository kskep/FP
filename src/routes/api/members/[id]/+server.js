import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

export async function PATCH({ params, request }) {
    try {
        const updates = await request.json();
        console.log('Updating member:', params.id, 'with:', updates);

        const result = await client
            .patch(params.id)
            .set({
                name: updates.name,
                rank: updates.rank
            })
            .commit();

        return json(result);
    } catch (err) {
        console.error('Error updating member:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error updating member'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

export async function DELETE({ params }) {
    try {
        await client.delete(params.id);
        return json({ success: true });
    } catch (err) {
        console.error('Error deleting member:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error deleting member'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
