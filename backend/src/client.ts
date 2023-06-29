import { QueryResult } from "pg";
import { pool, isDatabaseReady } from "./database/pool";
import axios from "axios";
// import * as mqtt from "mqtt";

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

/*

interface IKeyValuePair {
    key: string;
    value: string;
}

interface IChannel {
    channelName: string;
    keyValuePairs: IKeyValuePair[];
}

interface ISnapshot {
    inverterName: string;
    channels: IChannel[];
}


const createSnapshot = (inverterName: string, channelName: string, values: IKeyValuePair[]) => {
    pool.query(
        'INSERT INTO snapshot (inverterName) VALUES ($1) RETURNING *', 
        [inverterName], (error, results: QueryResult) => {
        if (error) {
            throw error;
        }
        console.log("createSnapshot results", results);
        createSnapshotChannel(results.rows[0].snapshotid, channelName, values);
    });
};

const createSnapshotChannel = (snapshotId: string, channelName: string, values: IKeyValuePair[]) => {
    pool.query(
        'INSERT INTO snapshot_channel (snapshotId, channelName) VALUES ($1, $2) RETURNING *', 
        [snapshotId, channelName], (error, results: QueryResult) => {
        if (error) {
            throw error;
        }
        console.log("createSnapshotChannel results", results);
        for (const entry of values) {
            createSnapshotValue(results.rows[0].snapshotchannelid, entry.key, entry.value);
        }
    });
};

const createSnapshotValue = (snapshotChannelId: string, valueKey: string, value: any) => {
    pool.query(
        'INSERT INTO snapshot_channel_value (snapshotChannelId, valueKey, value) VALUES ($1, $2, $3) RETURNING *', 
        [snapshotChannelId, valueKey, value], (error, results: QueryResult) => {
        if (error) {
            throw error;
        }
        console.log("createSnapshotValue results", results);
    });
};
const MQTT_BROKER_URL: any = process.env.MQTT_BROKER_URL ?? "tcp://localhost";
const MQTT_TOPIC: any = process.env.MQTT_TOPIC ?? "inverter";
const STORING_INTERVAL: any = process.env.STORING_INTERVAL ?? 30;

const snapshots: ISnapshot[] = [];

const updateSnapshot = (inverterName: string, channelName: string, valueKey: string, value: any) => {
    const keyValuePair = {
        key: valueKey,
        value: value
    };
    const channel = {
        channelName,
        keyValuePairs: [keyValuePair]
    };

    const snapshotIndex = snapshots.findIndex(s => s.inverterName === inverterName);
    if (snapshotIndex !== -1) {
        const channelIndex = snapshots[snapshotIndex].channels.findIndex(c => c.channelName === channelName);
        if (channelIndex !== -1) {
            const keyValuePairIndex = snapshots[snapshotIndex].channels[channelIndex].keyValuePairs.findIndex(p => p.key === valueKey);
            if (keyValuePairIndex !== -1) {
                snapshots[snapshotIndex].channels[channelIndex].keyValuePairs[keyValuePairIndex] = keyValuePair;
            } else {
                snapshots[snapshotIndex].channels[channelIndex].keyValuePairs.push(keyValuePair);
            }
        } else {
            snapshots[snapshotIndex].channels.push(channel);
        }
    } else {
        const snapshot = {
            inverterName,
            channels: [channel]
        };
        snapshots.push(snapshot);
    }
};

const client = mqtt.connect(`tcp://${MQTT_BROKER_URL}`);

client.on('connect', () => {
    client.subscribe(`${MQTT_TOPIC}/#`, (err) => {
        if (err) {
            console.log(err);
        } else {
            setInterval(() => {
                for (const snapshot of snapshots) {
                    for (const channel of snapshot.channels) {
                        createSnapshot(snapshot.inverterName, channel.channelName, channel.keyValuePairs);
                    }
                }
            }, STORING_INTERVAL * 1000);
        }
    })
});
  
client.on('message', (topic, message) => {
    const regexpDC = new RegExp(`${MQTT_TOPIC}\/(?<inverterName>.*)\/(?<channelName>.*)\/P_DC`, "g");
    for (const match of topic.matchAll(regexpDC)) {
        if (match.groups?.inverterName && match.groups?.channelName) {
            // console.log(`${match.groups.inverterName} ${match.groups.channelName}`);
            // console.log(message.toString())
            updateSnapshot(match.groups.inverterName, match.groups.channelName, "P_DC", message.toString());
        }
    }

    const regexpAC = new RegExp(`${MQTT_TOPIC}\/(?<inverterName>.*)\/(?<channelName>.*)\/P_AC`, "g");
    for (const match of topic.matchAll(regexpAC)) {
        if (match.groups?.inverterName && match.groups?.channelName) {
            // console.log(`${match.groups.inverterName} ${match.groups.channelName}`);
            // console.log(message.toString())
            updateSnapshot(match.groups.inverterName, match.groups.channelName, "P_AC", message.toString());
        }
    }
});

client.on("error", (error) => {
    console.log("error", error);
});

client.on("close", () => {
    console.log("close");
});
*/
