// /api/raids/[id]/distribute/+server.js
import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

export async function POST({ params }) {
    try {
        const raidId = params.id;

        // Fetch the raid details with validation that it hasn't been distributed yet
        const raid = await client.fetch(`
            *[_type == "raid" && _id == $raidId][0] {
                _id,
                name,
                dkpReward,
                distributed,
                participants[]->{
                    _id,
                    name
                }
            }
        `, { raidId });

        if (!raid) {
            return new Response(JSON.stringify({
                error: 'Raid not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (raid.distributed) {
            return new Response(JSON.stringify({
                error: 'DKP has already been distributed for this raid'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Processing raid:', raid);

        // Create DKP transactions for each participant
        const transactions = await Promise.all(
            raid.participants.map(async (participant) => {
                try {
                    // Create transaction with consistent structure
                    const transaction = await client.create({
                        _type: 'dkpTransaction',
                        member: {
                            _type: 'reference',
                            _ref: participant._id
                        },
                        amount: raid.dkpReward,
                        reason: `Raid: ${raid.name}`,
                        date: new Date().toISOString()
                    });

                    console.log(`Created transaction for ${participant.name}:`, transaction);
                    return transaction;
                } catch (err) {
                    console.error(`Error creating transaction for ${participant.name}:`, err);
                    throw err;
                }
            })
        );

        // Mark raid as distributed
        await client
            .patch(raidId)
            .set({ distributed: true })
            .commit();

        return json({
            success: true,
            message: `DKP awarded to ${raid.participants.length} members`,
            transactions
        });

    } catch (err) {
        console.error('Error distributing raid rewards:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error distributing raid rewards'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
