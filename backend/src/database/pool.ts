import { Pool } from 'pg'
 
require('dotenv').config();

let databaseReady = false;

export const isDatabaseReady = () => databaseReady;

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

pool.connect(() => {
    console.log("init database");
    pool.query(`
        CREATE SEQUENCE IF NOT EXISTS public."snapshot_snapshotId_seq"
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 9223372036854775807
        CACHE 1;

        ALTER SEQUENCE public."snapshot_snapshotId_seq" OWNER TO "pv-user";

        CREATE TABLE IF NOT EXISTS public.snapshot
        (
            "snapshotId" integer NOT NULL DEFAULT nextval('"snapshot_snapshotId_seq"'::regclass),
            "inverterName" character varying(100) COLLATE pg_catalog."default" NOT NULL,
            "createdAt" timestamp with time zone DEFAULT now(),
            CONSTRAINT snapshot_pkey PRIMARY KEY ("snapshotId")
        )
    
        TABLESPACE pg_default;
    
        ALTER TABLE IF EXISTS public.snapshot  OWNER to "pv-user";

        CREATE SEQUENCE IF NOT EXISTS public."snapshot_channel_snapshotChannelId_seq"
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 9223372036854775807
        CACHE 1;

        ALTER SEQUENCE public."snapshot_channel_snapshotChannelId_seq" OWNER TO "pv-user";
        
        CREATE TABLE IF NOT EXISTS public.snapshot_channel
        (
            "snapshotChannelId" integer NOT NULL DEFAULT nextval('"snapshot_channel_snapshotChannelId_seq"'::regclass),
            "snapshotId" integer NOT NULL,
            "channelName" character varying(100) COLLATE pg_catalog."default" NOT NULL,
            CONSTRAINT snapshot_channel_pkey PRIMARY KEY ("snapshotChannelId")
        )
        
        TABLESPACE pg_default;
        
        ALTER TABLE IF EXISTS public.snapshot_channel OWNER to "pv-user";

        CREATE SEQUENCE IF NOT EXISTS public."snapshot_channel_value_snapshotChannelValueId_seq"
        INCREMENT 1
        START 1
        MINVALUE 1
        MAXVALUE 9223372036854775807
        CACHE 1;

        ALTER SEQUENCE public."snapshot_channel_value_snapshotChannelValueId_seq" OWNER TO "pv-user";

        CREATE TABLE IF NOT EXISTS public.snapshot_channel_value
        (
            "snapshotChannelValueId" integer NOT NULL DEFAULT nextval('"snapshot_channel_value_snapshotChannelValueId_seq"'::regclass),
            "snapshotChannelId" integer NOT NULL,
            "fieldName" character varying(100) COLLATE pg_catalog."default" NOT NULL,
            "fieldValue" character varying(100) COLLATE pg_catalog."default" NOT NULL,
            CONSTRAINT snapshot_channel_value_pkey PRIMARY KEY ("snapshotChannelValueId")
        )

        TABLESPACE pg_default;

        ALTER TABLE IF EXISTS public.snapshot_channel_value OWNER to "pv-user";
        `).then(() => {
            databaseReady = true;
        });
});

pool.on("connect", (client) => {
    console.log("Pool connected!");
    // http://192.168.178.37/api/inverter/id/0

    // "ch0_fld_names":["U_AC","I_AC","P_AC","F_AC","PF_AC","Temp","YieldTotal","YieldDay","P_DC","Efficiency","Q_AC"],"fld_units":["V","A","W","Wh","kWh","%"],
    // "fld_names":["U_DC","I_DC","P_DC","YieldDay","YieldTotal","Irradiation"]

    // {"id":0,"enabled":true,"name":"HM-600","serial":"114182918284","version":"10010","power_limit_read":100,"ts_last_success":1688067369,
    // "ch":[[237,0,0,49.98,0,19.2,112.122,2808,0.9,0,0],[25.4,0.02,0.4,1397,56.202,0.094],[25.5,0.02,0.5,1411,55.92,0.118]],
    // "ch_name":["AC","EAST","WEST"],"ch_max_pwr":[null,425,425]}



});
