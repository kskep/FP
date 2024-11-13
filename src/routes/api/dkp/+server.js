import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

console.log('DKP endpoint file loaded');

export async function POST({ request }) {
    console.log('DKP endpoint called');
    try {
        const { memberId, amount, reason } = await request.json();
        console.log('Received data:', { memberId, amount, reason });

        // Create DKP transaction
        const transaction = await client.create({
            _type: 'dkpTransaction',
            member: {
                _type: 'reference',
                _ref: memberId
            },
            amount: amount,
            reason: reason,
            date: new Date().toISOString()
        });
        console.log('Created transaction:', transaction);

        // Update member's DKP
        const result = await client
            .patch(memberId)
            .inc({ dkp: amount })
            .commit();
        console.log('Updated member:', result);

        return json(result);

    } catch (err) {
        console.error('Error in DKP endpoint:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error adjusting DKP',
            details: err
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
