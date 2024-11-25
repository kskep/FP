import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

// POST method for creating raids
export async function POST({ request }) {
    try {
        const { name, dkpReward, participants } = await request.json();

        // Input validation
        if (!name || !dkpReward || !participants?.length) {
            return new Response(JSON.stringify({
                error: 'Missing required fields'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Creating raid with:', { name, dkpReward, participants });

        // Create raid document with distributed flag
        const raid = await client.create({
            _type: 'raid',
            name,
            date: new Date().toISOString(),
            dkpReward: parseInt(dkpReward),
            participants: participants.map(id => ({
                _type: 'reference',
                _ref: id
            })),
            distributed: true // Mark as distributed since we're creating transactions immediately
        });
        console.log('Raid created:', raid);

        // Create DKP transactions with consistent structure
        const transactions = await Promise.all(participants.map(async (participantId) => {
            try {
                // Create transaction with proper reference structure
                const transaction = await client.create({
                    _type: 'dkpTransaction',
                    member: {
                        _type: 'reference',
                        _ref: participantId
                    },
                    amount: parseInt(dkpReward),
                    reason: `Raid: ${name}`,
                    date: new Date().toISOString(),
                    transactionKey: `${participantId}-${name}-${new Date().toISOString()}` // Unique key
                });
                console.log('Created transaction:', transaction);
                return transaction;
            } catch (err) {
                console.error(`Error creating transaction for ${participantId}:`, err);
                throw err;
            }
        }));

        return json({
            success: true,
            raid,
            transactions,
            message: `Raid created and DKP awarded to ${participants.length} members`
        });

    } catch (err) {
        console.error('Error creating raid:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error creating raid',
            details: err
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

// DELETE method for removing raids
export async function DELETE({ params }) {
    try {
        // Get raid details before deletion
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
        `, { raidId: params.id });

        if (!raid) {
            return new Response(JSON.stringify({
                error: 'Raid not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        console.log('Deleting raid:', raid);

        // Only create negative transactions if DKP was distributed
        if (raid.distributed) {
            // Create negative DKP transactions
            await Promise.all(raid.participants.map(async (participant) => {
                try {
                    await client.create({
                        _type: 'dkpTransaction',
                        member: {
                            _type: 'reference',
                            _ref: participant._id
                        },
                        amount: -raid.dkpReward,
                        reason: `Raid Deleted: ${raid.name}`,
                        date: new Date().toISOString(),
                        transactionKey: `${participant._id}-${raid.name}-delete-${new Date().toISOString()}`
                    });

                    console.log(`Created negative transaction for ${participant.name}`);
                } catch (err) {
                    console.error(`Error processing participant ${participant._id}:`, err);
                    throw err;
                }
            }));
        }

        // Delete the raid document
        await client.delete(params.id);
        console.log('Raid deleted successfully');

        return json({
            success: true,
            message: raid.distributed
                ? `Raid deleted and DKP deducted from ${raid.participants.length} members`
                : 'Raid deleted (no DKP was distributed)'
        });

    } catch (err) {
        console.error('Error deleting raid:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error deleting raid',
            details: err
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
