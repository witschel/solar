import { Request, Response, NextFunction } from 'express';
import { pool } from '../database/pool';

const getStats = async (req: Request, res: Response, next: NextFunction) => {
    let startDate: number = req.query.startDate ? parseInt(String(req.query.startDate), 10) : 0;
    let endDate: number = req.query.startDate ? parseInt(String(req.query.endDate), 10) : new Date().getTime() / 1000;
    const result = await pool.query(
        `SELECT * FROM public.snapshot s LEFT JOIN public.snapshot_channel c ON s."snapshotId"=c."snapshotId" LEFT JOIN public.snapshot_channel_value v ON c."snapshotChannelId"=v."snapshotChannelId" WHERE $1 <= EXTRACT(EPOCH FROM "createdAt") AND $2 >= EXTRACT(EPOCH FROM "createdAt")`, 
    [startDate, endDate]);
    return res.status(200).json({
        message: result.rows
    });
};

export default { getStats };
