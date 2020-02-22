import { Connection, Message } from 'amqp-ts';

export const QUEUE = 'worker';

export const startWorker = async (connection: Connection) => {
    console.log('Starting worker...');

    const queue = connection.declareQueue(QUEUE, { durable: false, autoDelete: true });

    queue.activateConsumer(msg => {
        const payload = msg.getContent();
        console.log(payload.message);

        return new Message({ message: 'Polo!' });
    });
};
