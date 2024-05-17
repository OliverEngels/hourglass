import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse, TimeEntryData } from '../../components/schemes/api-entry';
import CORS from './middleware';
import clientPromise from './mongo';
import { ObjectId } from 'mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
    await CORS(req, res);

    switch (req.method) {
        case 'POST':
            try {
                const { startDate, endDate, tags, search } = req.body;

                const client = await clientPromise;
                const db = client.db(process.env.DB);
                const conditions = [];

                if (startDate && endDate) {
                    conditions.push({ date: { $gte: new Date(startDate), $lte: new Date(endDate) } });
                }
                if (tags && tags.length > 0) {
                    const tagValues = tags.map(tag => tag.value);
                    conditions.push({ "tags.value": { $all: tagValues } });
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

                const groupedByDate = entries.reduce((acc, obj) => {
                    //@ts-ignore
                    const date = obj.date.toISOString().slice(0, 10);

                    if (!acc[date]) {
                        acc[date] = [];
                    }
                    acc[date].push(obj);
                    return acc;
                }, {} as { [date: string]: TimeEntryData[] });

                for (const date in groupedByDate) {
                    groupedByDate[date].sort((a, b) => (a.starttime < b.starttime ? -1 : 1));
                }

                const sortedArray = Object.values(groupedByDate).reduce((acc, objs) => acc.concat(objs), []);

                res.status(200).json({ success: true, data: sortedArray });
            }
            catch (e) { }
            break;
        case 'DELETE':
            try {
                const { ids } = req.body;
                const objectIds = ids.map(id => new ObjectId(id));

                const client = await clientPromise;
                const db = client.db(process.env.DB);
                const entryCollection = db.collection<TimeEntryData>('entries');

                const deleteResult = await entryCollection.deleteMany(
                    { _id: { $in: objectIds } }
                );

                res.status(200).json({ success: true, data: deleteResult });
            }
            catch (e) { }
            break;
        default:
            res.setHeader('Allow', ['POST', 'DELETE']);
            res.status(405).json({ success: false, message: 'Method Not Allowed' });
    }
}