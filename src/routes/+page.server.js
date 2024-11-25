import { client } from '$lib/sanity';

export async function load() {
    try {
        const [members, transactions] = await Promise.all([
            client.fetch(`*[_type == "member"] {
                _id,
                name,
                rank,
                dkp,
                "wishlist": *[_type == "wishlistItem" && references(^._id)] {
                    _id,
                    name,
                    status,
                    notes
                }
            } | order(name asc)`),
            client.fetch(`*[_type == "dkpTransaction"] {
                _id,
                memberId,
                member->{
                    _id,
                    name
                },
                amount,
                _createdAt
            }`)
        ]);

        // Calculate actual DKP from transactions
        const dkpByMember = transactions.reduce((acc, trans) => {
            const memberId = trans.memberId || (trans.member && trans.member._id);
            if (!memberId) return acc;

            acc[memberId] = (acc[memberId] || 0) + trans.amount;
            return acc;
        }, {});

        // Update members with calculated DKP
        const membersWithCalculatedDKP = members.map(member => ({
            ...member,
            dkp: dkpByMember[member._id] || 0 // Replace stored DKP with calculated DKP
        }));

        return {
            members: membersWithCalculatedDKP
        };
    } catch (err) {
        console.error('Error loading data:', err);
        return {
            members: []
        };
    }
}
