import { ApiResponse } from '@components/schemes/api-entry';
import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../mongo';
import { ObjectId } from 'mongodb';
import CORS from '../middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    await CORS(req, res);

    if (req.method === 'DELETE') {
        const { id } = req.query;

        try {
            const client = await clientPromise;
            const db = client.db('hourglass');
            const collection = db.collection('entries');

            if (Array.isArray(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ID format'
                });
            }

            const deleteResult = await collection.deleteOne({ _id: new ObjectId(id) });

            res.status(201).json({
                success: true,
                message: 'Entry successfully deleted'
            });
        } catch (e) {
            res.status(500).json({
                success: false,
                message: `Failed to insert entry: ${e.message}`
            });
        }
    } else {
        res.setHeader('Allow', ['DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}