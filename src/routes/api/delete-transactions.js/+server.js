import { client } from '$lib/sanity';
import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        // First check what will be deleted
        const checkQuery = '*[_type == "dkpTransaction" && dateTime(_createdAt) > dateTime("2024-11-24T00:00:00Z")] { _id, memberId, amount, reason, _createdAt }';
        const transactions = await client.fetch(checkQuery);

        console.log('Transactions to be deleted:', transactions);
        console.log('Total count:', transactions.length);

        // Uncomment this to actually delete
        const deleteQuery = '*[_type == "dkpTransaction" && dateTime(_createdAt) > dateTime("2024-11-24T00:00:00Z")]';
        const result = await client.delete({query: deleteQuery});
        return json({ success: true, deleted: result });

        return json({ transactions, count: transactions.length });
    } catch (error) {
        console.error('Error:', error);
        return json({ error: error.message }, { status: 500 });
    }
}