import { json } from '@sveltejs/kit';

export async function POST({ params, request }) {
    console.log('Endpoint hit with params:', params);
    return json({ message: 'Test endpoint working' });
}
