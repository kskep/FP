import { client } from '$lib/sanity';

export async function load() {
    try {
        const [members, transactions] = await Promise.all([
            client.fetch(`*[_type == "member"] {
                _id,
                name,
                rank,
                "dkp": coalesce(dkp, 0)
            } | order(name asc)`),
            client.fetch(`*[_type == "dkpTransaction"] {
                _id,
                member->{
                    _id,
                    name
                },
                amount,
                reason,
                date
            } | order(date desc)`)
        ]);

        // Calculate DKP from transactions
        const dkpByMember = transactions.reduce((acc, trans) => {
            if (!trans.member?._id) return acc;

            acc[trans.member._id] = (acc[trans.member._id] || 0) + trans.amount;
            return acc;
        }, {});

        // Group transactions by member
        const transactionsByMember = transactions.reduce((acc, trans) => {
            if (!trans.member?._id) return acc;

            if (!acc[trans.member._id]) {
                acc[trans.member._id] = [];
            }
            acc[trans.member._id].push(trans);
            return acc;
        }, {});

        // Update members with calculated DKP
        const membersWithCalculatedDKP = members.map(member => ({
            ...member,
            calculatedDKP: dkpByMember[member._id] || 0
        }));

        return {
            members: membersWithCalculatedDKP,
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
