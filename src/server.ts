import { Connection } from 'amqp-ts';
import { startWorker, QUEUE } from './worker';
const connectionRetryTime = 30000; // Try to connect to rabbit mq for 30 seconds
const connectRetryInterval = 100; // See every 100 ms if rabbitmq is connected

const ensureConnection = async (connection: Connection) => {
    return new Promise(async (resolve, reject) => {
        if (!connection.isConnected) {
            const triesObject = { tries: 0 };

            recursiveConnectionResolve(connection, resolve, triesObject);
        } else {
            resolve();
        }
    });
};

const recursiveConnectionResolve = (
    connection: Connection,
    resolve: (value?: unknown) => void,
    triesObject: { tries: number },
) => {
    setTimeout(() => {
        if (connection.isConnected) {
            resolve();
        } else {
            triesObject.tries++;
            recursiveConnectionResolve(connection, resolve, triesObject);

            if (triesObject.tries * connectRetryInterval >= connectionRetryTime) {
                console.log('Fatal: Tried connecting to rabbitmq for more then 30 seconds');
                process.exit(0);
            }
        }
    }, connectRetryInterval);
};

const start = async () => {
    const connection = new Connection('amqp://rabbitmq:rabbitmq@localhost:5672');
    await ensureConnection(connection);

    await startWorker(connection);
    await startServer(connection);
};
const startServer = async (connection: Connection) => {
    console.log('Starting server...');
    const queue = connection._queues[QUEUE];
    const response = await queue.rpc({ message: 'Marco!' });
    const parsedResponse = JSON.parse(response.getContent());

    console.log(parsedResponse.message);
};

start();
