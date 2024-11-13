import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

export async function POST({ params, request }) {
    try {
        const { amount, reason } = await request.json();
        console.log('Adjusting DKP for member:', params.id, { amount, reason });

        // Get current member DKP
        const member = await client.fetch(
            `*[_type == "member" && _id == $memberId][0]`,
            { memberId: params.id }
        );

        if (!member) {
            throw new Error('Member not found');
        }

        // Create DKP transaction
        const transaction = await client.create({
            _type: 'dkpTransaction',
            member: {
                _type: 'reference',
                _ref: params.id
            },
            amount: parseInt(amount),
            reason: reason,
            date: new Date().toISOString()
        });

        console.log('Created DKP transaction:', transaction);

        // Update member's DKP
        const updatedMember = await client
            .patch(params.id)
            .set({
                dkp: (member.dkp || 0) + parseInt(amount)
            })
            .commit();

        console.log('Updated member DKP:', updatedMember);

        return json({
            success: true,
            transaction,
            member: updatedMember
        });

    } catch (err) {
        console.error('Error adjusting DKP:', err);
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
