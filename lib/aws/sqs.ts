import { SQSClient } from "@aws-sdk/client-sqs";

export type SqsQueueConfig = {
  accessKeyId: string;
  queueUrl: string;
  region: string;
  secretAccessKey: string;
};

const globalForSqs = globalThis as typeof globalThis & {
  sqsClient?: SQSClient;
  sqsConfigKey?: string;
};

export function getSqsQueueConfig(): SqsQueueConfig | null {
  const region = process.env.AWS_REGION?.trim() ?? "";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim() ?? "";
  const queueUrl = process.env.AWS_SQS_QUEUE_URL?.trim() ?? "";

  if (!region || !accessKeyId || !secretAccessKey || !queueUrl) {
    return null;
  }

  return {
    accessKeyId,
    queueUrl,
    region,
    secretAccessKey
  };
}

export function getSqsClient(config: SqsQueueConfig): SQSClient {
  const configKey = `${config.region}:${config.accessKeyId}:${config.queueUrl}`;

  if (!globalForSqs.sqsClient || globalForSqs.sqsConfigKey !== configKey) {
    globalForSqs.sqsClient = new SQSClient({
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey
      },
      region: config.region
    });
    globalForSqs.sqsConfigKey = configKey;
  }

  return globalForSqs.sqsClient;
}
