import { json } from '@sveltejs/kit';
import { OFFICER_PASSWORD } from '$env/static/private';

export async function POST({ request }) {
    try {
        const { password } = await request.json();

        // Check if environment variable is set
        if (!OFFICER_PASSWORD) {
            console.error('OFFICER_PASSWORD environment variable is not set');
            return new Response(JSON.stringify({
                error: 'Server configuration error'
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        if (password === OFFICER_PASSWORD) {
            return json({ success: true });
        }

        return new Response(JSON.stringify({ error: 'Invalid password' }), {
            status: 401,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    } catch (err) {
        console.error('Error checking password:', err);
        return new Response(JSON.stringify({
            error: 'Server error'
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
