// app/routes/api/saveTimeSlot.js
import { json } from '@remix-run/node';
import prisma from '../db.server';

export const action = async ({ request }) => {
  const requestBody = await request.json(); // Parse the incoming request as JSON
  const time = requestBody.time;

  const savedTimeSlot = await prisma.timeSlot.create({
    data: { time },
  });

  return json(savedTimeSlot);
};
