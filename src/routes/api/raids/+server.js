import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

// POST method for creating raids
export async function POST({ request }) {
    try {
        const { name, dkpReward, participants } = await request.json();
        console.log('Creating raid with:', { name, dkpReward, participants });

        // Create raid document
        const raid = await client.create({
            _type: 'raid',
            name,
            date: new Date().toISOString(),
            dkpReward,
            participants: participants.map(id => ({
                _type: 'reference',
                _ref: id
            }))
        });
        console.log('Raid created:', raid);

        // Create DKP transactions and update member DKP
        for (const participantId of participants) {
            try {
                // Create transaction
                const transaction = await client.create({
                    _type: 'dkpTransaction',
                    member: {
                        _type: 'reference',
                        _ref: participantId
                    },
                    amount: dkpReward,
                    reason: `Raid: ${name}`,
                    date: new Date().toISOString()
                });
                console.log('Created transaction:', transaction);

                // Get current member DKP
                const member = await client.fetch(
                    `*[_type == "member" && _id == $memberId][0]`,
                    { memberId: participantId }
                );
                console.log('Current member state:', member);

                // Update member's DKP
                const updatedMember = await client
                    .patch(participantId)
                    .set({
                        dkp: (member.dkp || 0) + dkpReward
                    })
                    .commit();
                console.log('Updated member:', updatedMember);
            } catch (err) {
                console.error(`Error processing participant ${participantId}:`, err);
                throw err;
            }
        }

        return json({
            success: true,
            raid,
            message: `DKP awarded to ${participants.length} members`
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
                    member: {
                        _type: 'reference',
                        _ref: participant._id
                    },
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
