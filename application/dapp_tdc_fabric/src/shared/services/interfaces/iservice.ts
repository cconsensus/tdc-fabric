import { Contract } from 'fabric-network';
import { Queue } from 'bullmq';

export interface ISubmitService {
  execute: (contract: Contract) => Promise<{ txId: string }>;
  executeAsyncTransaction: (queue: Queue, jobUser: string) => Promise<{ jobId: string; timestamp: string }>;
}

export interface IEvaluateService {
  execute: (contract: Contract) => Promise<any>;
}
