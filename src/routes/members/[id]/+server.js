export async function PATCH({ params, request }) {
    try {
        const updates = await request.json();
        console.log('Received update request for member:', params.id);
        console.log('Update data:', updates);

        // First, verify the member exists
        const existingMember = await client.fetch(
            `*[_type == "member" && _id == $id][0]`,
            { id: params.id }
        );

        if (!existingMember) {
            console.error('Member not found:', params.id);
            return new Response(JSON.stringify({
                error: 'Member not found'
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Perform the update
        const result = await client
            .patch(params.id)
            .set({
                name: updates.name,
                rank: updates.rank
            })
            .commit();

        console.log('Update successful:', result);

        return json({
            success: true,
            member: result
        });

    } catch (err) {
        console.error('Error updating member:', err);
        return new Response(JSON.stringify({
            error: err.message || 'Error updating member',
            details: err
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}