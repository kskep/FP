import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    console.log('DKP endpoint called');
    try {
        const { memberId, amount, reason } = await request.json();

        // Validate inputs
        if (!memberId || amount === undefined || !reason) {
            return new Response(JSON.stringify({
                error: 'Missing required fields'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check if member exists
        const memberExists = await client.fetch(
            `*[_type == "member" && _id == $memberId][0]`,
            { memberId }
        );

        if (!memberExists) {
            return new Response(JSON.stringify({
                error: 'Member not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Create DKP transaction with consistent structure
        const transaction = await client.create({
            _type: 'dkpTransaction',
            member: {
                _type: 'reference',
                _ref: memberId
            },
            amount: parseInt(amount),
            reason: reason,
            date: new Date().toISOString()
        });

        console.log('Created transaction:', transaction);

        return json({
            success: true,
            transaction
        });

    } catch (err) {
        console.error('Error in DKP endpoint:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error adjusting DKP'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
