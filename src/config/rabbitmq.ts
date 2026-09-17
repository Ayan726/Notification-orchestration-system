import amqp from "amqplib";
import type { Channel, ChannelModel } from "amqplib";

let channel: Channel;
let connection: ChannelModel;

export async function connectToRabbitmq() {
  try {
    connection = await amqp.connect(
      process.env.RABBITMQ_URL || "amqp://localhost:5672",
    );
    channel = await connection.createChannel();
    return channel;
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
  }
}

export async function getChannel() {
  if (!channel) {
    throw new Error("RabbitMQ channel is not initialized.");
  }
  return channel;
}
