import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, TagData } from '../../components/schemes/api-tag';
import clientPromise from './mongo';
import CORS from './middleware';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    await CORS(req, res);

    switch (req.method) {
        case 'GET':
            const client = await clientPromise;
            const db = client.db(process.env.DB);
            const data = await db.collection("tags").find({}).toArray();

            const tags: TagData[] = [];
            data.map((e, i) => {
                tags[i] = {
                    id: e._id,
                    value: e.value,
                    color: 'orange'
                };
            });

            res.status(200).json({ success: true, data: data });
            break;

        default:
            res.setHeader('Allow', ['GET']);
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}