// app/routes/api/deleteTimeSlot.js
import { json } from '@remix-run/node';
import prisma from '../db.server';

export const action = async ({ params }) => {
  // Convert the timeSlotId from string to integer
  const timeSlotId = parseInt(params.timeSlotId, 10);

  // Check if the conversion was successful
  if (isNaN(timeSlotId)) {
    return new Response("Invalid time slot ID", { status: 400 });
  }

  try {
    await prisma.timeSlot.delete({
      where: { id: timeSlotId },
    });

    return json({ success: true });
  } catch (error) {
    console.error('Failed to delete time slot:', error);
    return json({ success: false, error: "Failed to delete time slot" }, { status: 500 });
  }
};
