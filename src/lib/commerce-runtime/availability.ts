/**
 * Availability Runtime Module
 * Handles resolution of availability windows, booking slots, and scheduling
 */

import { InventoryItem, AvailabilityWindow } from '../types';

/**
 * Resolve available booking slots from inventory
 */
export function resolveAvailability(
  inventoryItems: InventoryItem[],
  options?: {
    dayOfWeek?: number;
    startTime?: string;
    endTime?: string;
  }
): AvailabilityWindow[] {
  const bookingItems = inventoryItems.filter(
    (item) => item.type === 'booking_slot' && item.availabilityWindows
  );

  const allWindows = bookingItems.flatMap((item) => item.availabilityWindows || []);

  let filtered = allWindows;

  if (options?.dayOfWeek !== undefined) {
    filtered = filtered.filter((w) => w.dayOfWeek === options.dayOfWeek);
  }

  if (options?.startTime) {
    filtered = filtered.filter((w) => w.startTime >= options.startTime!);
  }

  if (options?.endTime) {
    filtered = filtered.filter((w) => w.endTime <= options.endTime!);
  }

  return filtered;
}

/**
 * Get weekly availability summary
 */
export function getWeeklyAvailability(inventoryItems: InventoryItem[]): {
  [day: string]: { windows: AvailabilityWindow[]; totalHours: number };
} {
  const availability = resolveAvailability(inventoryItems);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const summary: { [day: string]: { windows: AvailabilityWindow[]; totalHours: number } } = {};

  days.forEach((day, index) => {
    const dayWindows = availability.filter((w) => w.dayOfWeek === index);
    const totalHours = dayWindows.reduce((sum, w) => {
      const start = parseTime(w.startTime);
      const end = parseTime(w.endTime);
      return sum + (end - start) / 60;
    }, 0);

    summary[day] = { windows: dayWindows, totalHours };
  });

  return summary;
}

/**
 * Check if a time slot is available
 */
export function isSlotAvailable(
  inventoryItems: InventoryItem[],
  dayOfWeek: number,
  startTime: string,
  durationMinutes: number
): boolean {
  const dayAvailability = resolveAvailability(inventoryItems, { dayOfWeek });

  const requestedStart = parseTime(startTime);
  const requestedEnd = requestedStart + durationMinutes;

  return dayAvailability.some((window) => {
    const windowStart = parseTime(window.startTime);
    const windowEnd = parseTime(window.endTime);
    const slotDuration = window.slotDuration || durationMinutes;

    return (
      requestedStart >= windowStart &&
      requestedEnd <= windowEnd &&
      (requestedEnd - requestedStart) <= slotDuration
    );
  });
}

/**
 * Parse time string (HH:MM) to minutes
 */
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Format availability for display
 */
export function formatAvailabilityForDisplay(availability: AvailabilityWindow[]): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return availability
    .map((w) => `${days[w.dayOfWeek]} ${w.startTime}-${w.endTime}`)
    .join(', ');
}
