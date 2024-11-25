import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

export async function DELETE({ params }) {
    try {
        // Get raid details before deletion
        const raid = await client.fetch(`
            *[_type == "raid" && _id == $raidId][0] {
                _id,
                name,
                dkpReward,
                participants[]->{
                    _id,
                    name,
                    dkp
                }
            }
        `, { raidId: params.id });

        if (!raid) {
            throw new Error('Raid not found');
        }

        console.log('Deleting raid:', raid);

        // Deduct DKP from each participant
        for (const participant of raid.participants) {
            try {
                // Create negative DKP transaction
                await client.create({
                    _type: 'dkpTransaction',
                    memberId: participant._id,
                    amount: -raid.dkpReward,
                    reason: `Raid Deleted: ${raid.name}`,
                    date: new Date().toISOString()
                });

                // Update member's DKP
                await client
                    .patch(participant._id)
                    .set({
                        dkp: (participant.dkp || 0) - raid.dkpReward
                    })
                    .commit();

                console.log(`Deducted DKP from ${participant.name}`);
            } catch (err) {
                console.error(`Error processing participant ${participant._id}:`, err);
                throw err;
            }
        }

        // Delete the raid document
        await client.delete(params.id);
        console.log('Raid deleted successfully');

        return json({
            success: true,
            message: `Raid deleted and DKP deducted from ${raid.participants.length} members`
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
