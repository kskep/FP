import { client } from '$lib/sanity';

export async function load() {
    try {
        const [members, transactions] = await Promise.all([
            client.fetch(`*[_type == "member"] | order(name asc)`),
            client.fetch(`*[_type == "dkpTransaction"] {
                _id,
                amount,
                reason,
                date,
                member->{
                    _id,
                    name
                }
            } | order(date desc)`)
        ]);

        // Group transactions by member
        const transactionsByMember = transactions.reduce((acc, trans) => {
            if (!acc[trans.member._id]) {
                acc[trans.member._id] = [];
            }
            acc[trans.member._id].push(trans);
            return acc;
        }, {});

        return {
            members,
            transactionsByMember
        };
    } catch (err) {
        console.error('Error loading data:', err);
        return {
            members: [],
            transactionsByMember: {}
        };
    }
}
