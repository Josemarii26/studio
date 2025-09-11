import { config } from 'dotenv';
config();

import '@/ai/flows/nutritional-chat-analysis.ts';
import '@/ai/flows/request-notification-permission.ts';
import '@/ai/flows/send-notification.ts';
