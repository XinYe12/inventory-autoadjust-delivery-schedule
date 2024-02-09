import { json } from '@remix-run/node';
import prisma from '../db.server';

export const loader = async ({ request }) => {
  const timeSlots = await prisma.timeSlot.findMany();

  // Create a Response object with JSON body
  const response = new Response(JSON.stringify(timeSlots), {
    // Set status code and response headers
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning" ,
    },
  });

  return response;
};
