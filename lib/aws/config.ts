export function getAwsRuntimeConfig() {
  return {
    region: process.env.AWS_REGION ?? "us-east-1",
    bucket: process.env.AWS_S3_BUCKET ?? "",
    mediaDistributionId: process.env.AWS_CLOUDFRONT_DISTRIBUTION_ID ?? ""
  };
}
