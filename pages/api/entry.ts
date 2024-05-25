import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, validateEntry } from '../../components/schemes/api-entry';
import clientPromise from './mongo';
import CORS from './middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    await CORS(req, res);

    switch (req.method) {
        case 'POST':
            try {
                const { error, value } = validateEntry(req.body);
                if (error) {
                    return res.status(400).json({
                        success: false,
                        message: error.details.map(x => x.message).join(', ')
                    });
                }

                const client = await clientPromise;
                const db = client.db('hourglass');
                const collection = db.collection('entries');

                delete value.id;

                const result = await collection.insertOne(value);
                const objectId = result.insertedId;

                res.status(201).json({
                    success: true,
                    message: 'Entry inserted successfully',
                    data: { objectId: objectId.toString() }
                });
            } catch (e) {
                res.status(500).json({
                    success: false,
                    message: `Failed to insert entry: ${e.message}`
                });
            }
            break;
        case 'DELETE':

            try {
                const client = await clientPromise;
                const db = client.db('hourglass');
                const collection = db.collection('entries');

                const objectId = req.body.objectId;
                const deleteResult = await collection.deleteOne({ _id: objectId });

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
            break;
        default:
            res.setHeader('Allow', ['POST', 'DELETE']);
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}