const cron = require('node-cron');
const { DateTime } = require('luxon');
const EventModel = require('../Models/EventModel');

const TIME_ZONE = 'Asia/Kolkata';

async function updateEventStatuses() {
  const now = DateTime.now().setZone(TIME_ZONE);
  const startOfToday = now.startOf('day').toFormat('yyyy-MM-dd');
  const startOfTomorrow = now
    .plus({ days: 1 })
    .startOf('day')
    .toFormat('yyyy-MM-dd');

  try {
    // Events before today are completed.
    await EventModel.updateMany(
      {
        eventDate: { $lt: startOfToday },
        status: { $ne: 'cancelled' }
      },
      {
        $set: { status: 'completed' }
      }
    );

    // Events occurring today are ongoing.
    await EventModel.updateMany(
      {
        eventDate: {
          $gte: startOfToday,
          $lt: startOfTomorrow
        },
        status: { $nin: ['cancelled', 'completed'] }
      },
      {
        $set: { status: 'ongoing' }
      }
    );

    // Future events are upcoming.
    await EventModel.updateMany(
      {
        eventDate: { $gte: startOfTomorrow },
        status: { $nin: ['cancelled', 'completed'] }
      },
      {
        $set: { status: 'upcoming' }
      }
    );

    console.log(
      `\\\[${now.toISO()}] Event statuses updated successfully`
    );
  } catch (error) {
    console.error('Event status update failed:', error);
  }
}

// Run daily at 12:00 AM Indian Standard Time.
function startEventStatusJob() {
  cron.schedule(
    '0 0 * * *',
    updateEventStatuses,
    { timezone: TIME_ZONE }
  );

  // Also update statuses immediately when the server starts.
  updateEventStatuses();
}

module.exports = {
  startEventStatusJob,
  updateEventStatuses
};
