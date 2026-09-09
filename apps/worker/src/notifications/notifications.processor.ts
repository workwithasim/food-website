import { Job } from 'bullmq';
import { appLogger } from '@restaurant/observability';

export const handleNotificationJob = async (job: Job) => {
  const event = job.data;
  appLogger.info(`Handling notification for event: ${event.event_type} (Aggregate ID: ${event.aggregate_id})`);
  
  // Future implementation:
  // if (event.event_type === 'ORDER_PLACED') sendEmail()
  // else if (event.event_type === 'ORDER_READY') sendPushNotification()
  
  return { delivered: true, eventId: event.id };
};
