export const POST_PUBLISH_QUEUE = 'post-publish';

export const POST_PUBLISH_JOB = 'publish';

export type PublishPostJobData = {
  postId: string;
  userId: string;
};
