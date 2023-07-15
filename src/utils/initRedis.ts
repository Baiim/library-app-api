/* eslint-disable no-console */
import * as redis from 'redis';
import {config as dotenv} from 'dotenv';

dotenv();
const NODE_ENV = process.env.NODE_ENV as string;

const socket = NODE_ENV === 'production' ? {host: 'redis_client'} : {port: 6379, host: '127.0.0.1'};

const client = redis.createClient({
    socket,
});

// const client = redis.createClient({
//     socket: {
//         port: 6379,
//         host: '103.59.95.40',
//     },
// });

(async () => {
    await client.connect();
})();

client.on('connect', () => {
    console.log('Client connected to redis...');
});

client.on('ready', () => {
    console.log('Client connected to redis and ready to use...');
});

client.on('error', (err) => {
    console.log(JSON.parse(JSON.stringify(err)));
    console.log(err.message);
});

client.on('end', () => {
    console.log('Client disconnected from redis');
});

process.on('SIGINT', () => {
    client.quit();
});

export default client;
