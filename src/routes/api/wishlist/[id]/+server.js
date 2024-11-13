import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

export async function PATCH({ params, request }) {
    try {
        const { status } = await request.json();

        const result = await client
            .patch(params.id)
            .set({ status })
            .commit();

        return json(result);
    } catch (err) {
        console.error('Error updating wishlist item:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error updating wishlist item'
        }), {
            status: 500
        });
    }
}

export async function DELETE({ params }) {
    try {
        await client.delete(params.id);
        return json({ success: true });
    } catch (err) {
        console.error('Error deleting wishlist item:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error deleting wishlist item'
        }), {
            status: 500
        });
    }
}
