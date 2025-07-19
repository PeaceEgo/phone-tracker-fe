import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const response = await fetch('https://phone-tracker-be.onrender.com/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body),
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ message: data.message || 'Registration failed' });
        }

        return res.status(201).json(data);
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}