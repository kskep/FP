import { client } from '$lib/sanity';

export async function load() {
    try {
        const [raids, members] = await Promise.all([
            client.fetch(`
                *[_type == "raid"] | order(date desc) {
                    _id,
                    name,
                    date,
                    dkpReward,
                    distributed,
                    participants[]->{
                        _id,
                        name,
                        rank
                    }
                }
            `),
            client.fetch(`*[_type == "member"] | order(name asc)`)
        ]);

        return {
            raids,
            members
        };
    } catch (err) {
        console.error('Error loading raids:', err);
        return {
            raids: [],
            members: []
        };
    }
}
