import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, TimeEntryData } from '../../components/schemes/api-entry';
import CORS from './middleware';
import clientPromise from './mongo';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    await CORS(req, res);

    switch (req.method) {
        case 'POST':
            const { startDate, endDate, tags, search } = req.body;

            const client = await clientPromise;
            const db = client.db(process.env.DB);
            const conditions = [];

            if (startDate && endDate) {
                conditions.push({ date: { $gte: new Date(startDate), $lte: new Date(endDate) } });
            }
            if (tags && tags.length > 0) {
                conditions.push({ tags: { $in: tags } });
            }
            if (search) {
                conditions.push({
                    $or: [
                        { description: { $regex: new RegExp(`.*${search}.*`, 'i') } },
                        { notes: { $regex: new RegExp(`.*${search}.*`, 'i') } }
                    ]
                });
            }
            const query = conditions.length > 0 ? { $and: conditions } : {};
            const data = await db.collection("entries").find(query).toArray();


            const entries: TimeEntryData[] = [];
            data.map((e, i) => {
                entries[i] = {
                    id: e._id,
                    date: e.date,
                    starttime: e.starttime,
                    endtime: e.endtime,
                    description: e.description,
                    notes: e.notes,
                    tags: e.tags
                };
            });

            res.status(200).json({ success: true, data: entries });
            break;

        default:
            res.setHeader('Allow', ['POST']);
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}