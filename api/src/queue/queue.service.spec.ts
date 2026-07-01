import { QueueService } from './queue.service';

jest.mock('bullmq', () => {
  const mockQueue = {
    add: jest.fn(),
    getJob: jest.fn(),
    close: jest.fn(),
  };

  return {
    Queue: jest.fn(() => mockQueue),
    __mockQueue: mockQueue,
  };
});

const { __mockQueue: mockQueue } = jest.requireMock('bullmq') as {
  __mockQueue: {
    add: jest.Mock;
    getJob: jest.Mock;
    close: jest.Mock;
  };
};

describe('QueueService', () => {
  let queueService: QueueService;

  beforeEach(() => {
    jest.clearAllMocks();
    queueService = new QueueService();
  });

  afterEach(async () => {
    await queueService.onModuleDestroy();
  });

  it('skips remove when job is active (worker is processing it)', async () => {
    const remove = jest.fn();
    mockQueue.getJob.mockResolvedValue({
      getState: jest.fn().mockResolvedValue('active'),
      remove,
    });

    await queueService.removePublishJob('post-1');

    expect(remove).not.toHaveBeenCalled();
  });

  it('ignores locked-job errors from BullMQ', async () => {
    const remove = jest
      .fn()
      .mockRejectedValue(
        new Error(
          'Job post-1 could not be removed because it is locked by another worker',
        ),
      );
    mockQueue.getJob.mockResolvedValue({
      getState: jest.fn().mockResolvedValue('delayed'),
      remove,
    });

    await expect(queueService.removePublishJob('post-1')).resolves.toBeUndefined();
  });

  it('removes delayed job before rescheduling', async () => {
    const remove = jest.fn().mockResolvedValue(undefined);
    mockQueue.getJob.mockResolvedValue({
      getState: jest.fn().mockResolvedValue('delayed'),
      remove,
    });

    const scheduledAt = new Date(Date.now() + 120_000);
    await queueService.schedulePublish('post-1', 'user-1', scheduledAt);

    expect(remove).toHaveBeenCalled();
    expect(mockQueue.add).toHaveBeenCalledWith(
      'publish',
      { postId: 'post-1', userId: 'user-1' },
      expect.objectContaining({ jobId: 'post-1' }),
    );
  });
});
