import Dexie from 'dexie';

export const db = new Dexie('RBTC_IMS_Global_Offline');
db.version(1).stores({
    // One generic table to rule them all
    request_outbox: '++id, url, method, data, timestamp'
});