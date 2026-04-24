import { SQSClient } from "@aws-sdk/client-sqs";

export type SqsQueueConfig = {
  accessKeyId: string;
  queueUrl: string;
  region: string;
  secretAccessKey: string;
  sessionToken?: string;
};

const globalForSqs = globalThis as typeof globalThis & {
  sqsClient?: SQSClient;
  sqsConfigKey?: string;
};

function getSanitizedAwsEnvValue(key: string) {
  const rawValue = process.env[key];

  if (!rawValue) {
    return "";
  }

  const trimmedValue = rawValue.trim();

  if (
    (trimmedValue.startsWith("\"") && trimmedValue.endsWith("\"")) ||
    (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))
  ) {
    return trimmedValue.slice(1, -1).trim();
  }

  return trimmedValue;
}

export function getSqsQueueConfig(): SqsQueueConfig | null {
  const region = getSanitizedAwsEnvValue("AWS_REGION");
  const accessKeyId = getSanitizedAwsEnvValue("AWS_ACCESS_KEY_ID");
  const secretAccessKey = getSanitizedAwsEnvValue("AWS_SECRET_ACCESS_KEY");
  const sessionToken = getSanitizedAwsEnvValue("AWS_SESSION_TOKEN");
  const queueUrl = getSanitizedAwsEnvValue("AWS_SQS_QUEUE_URL");

  if (!region || !accessKeyId || !secretAccessKey || !queueUrl) {
    return null;
  }

  return {
    accessKeyId,
    queueUrl,
    region,
    secretAccessKey,
    ...(sessionToken ? { sessionToken } : {})
  };
}

export function getSqsClient(config: SqsQueueConfig): SQSClient {
  const configKey = `${config.region}:${config.accessKeyId}:${config.queueUrl}:${config.sessionToken ?? ""}`;

  if (!globalForSqs.sqsClient || globalForSqs.sqsConfigKey !== configKey) {
    globalForSqs.sqsClient = new SQSClient({
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
        ...(config.sessionToken ? { sessionToken: config.sessionToken } : {})
      },
      region: config.region
    });
    globalForSqs.sqsConfigKey = configKey;
  }

  return globalForSqs.sqsClient;
}
