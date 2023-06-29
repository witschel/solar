import { QueryResult } from "pg";
import { pool, isDatabaseReady } from "./database/pool";
import axios from "axios";

require('dotenv').config();

const STORING_INTERVAL: any = process.env.STORING_INTERVAL ?? 30;
const AHOY_DTU_URL: any = process.env.AHOY_DTU_URL ?? "http://localhost";

const ch0_fld_names = ["U_AC","I_AC","P_AC","F_AC","PF_AC","Temp","YieldTotal","YieldDay","P_DC","Efficiency","Q_AC"];
const fld_names = ["U_DC","I_DC","P_DC","YieldDay","YieldTotal","Irradiation"];

setInterval(() => {
    if (isDatabaseReady()) {
        axios.get(`${AHOY_DTU_URL}/api/inverter/id/0`).then((result: any) => {
            // console.log(result);
            const data = result.data;
            const inverterName = data.name;
            const channelValues = data.ch;
            const channelNames = data.ch_name;
            for (let i = 0; i < channelNames.length; i++) {
                const channelName = channelNames[i];
                const values = channelValues[i];
                if (values.length === ch0_fld_names.length) {
                    createSnapshot(inverterName, channelName, values, ch0_fld_names);
                } else if (values.length === fld_names.length) {
                    createSnapshot(inverterName, channelName, values, fld_names);
                }
            }
        });
    }
}, STORING_INTERVAL * 1000);

const createSnapshot = (inverterName: string, channelName: string, values: any[], fieldNames: string[]) => {
    pool.query(
        'INSERT INTO public.snapshot ("inverterName") VALUES ($1) RETURNING *', 
        [inverterName], (error, results: QueryResult) => {
        if (error) {
            throw error;
        }
        // console.log("createSnapshot results", results);
        createSnapshotChannel(results.rows[0].snapshotId, channelName, values, fieldNames);
    });
};

const createSnapshotChannel = (snapshotId: string, channelName: string, values: any[], fieldNames: string[]) => {
    pool.query(
        'INSERT INTO public.snapshot_channel ("snapshotId", "channelName") VALUES ($1, $2) RETURNING *', 
        [snapshotId, channelName], (error, results: QueryResult) => {
        if (error) {
            throw error;
        }
        // console.log("createSnapshotChannel results", results);
        for (let i = 0; i < values.length; i++) {
            createSnapshotValue(results.rows[0].snapshotChannelId, values[i], fieldNames[i]);
        }
    });
};

const createSnapshotValue = (snapshotChannelId: string, value: any, fieldName: string) => {
    pool.query(
        'INSERT INTO public.snapshot_channel_value ("snapshotChannelId", "fieldName", "fieldValue") VALUES ($1, $2, $3) RETURNING *', 
        [snapshotChannelId, fieldName, value], (error, results: QueryResult) => {
        if (error) {
            throw error;
        }
        // console.log("createSnapshotValue results", results);
    });
};
