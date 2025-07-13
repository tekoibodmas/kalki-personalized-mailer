'use server';

import { config } from 'dotenv';
config();

import '@/ai/flows/get-placeholders-from-sheet.ts';
import '@/ai/flows/validate-placeholders.ts';
import '@/ai/flows/validate-license.ts';
