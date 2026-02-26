export const BOOKING_MESSAGES = {
  CREATE_SUCCESS: 'Your appointment has been successfully booked.',
  CANCEL_SUCCESS: 'Your booking has been cancelled successfully.',
  RESCHEDULE_SUCCESS: 'Your booking has been rescheduled successfully.',
  EXTEND_SUCCESS: 'Your booking has been extended successfully.',
  FETCH_FAILED: 'Failed to fetch bookings.',
  CREATE_FAILED: 'Failed to create booking.',
  CANCEL_FAILED: 'Failed to cancel booking.',
  RESCHEDULE_FAILED: 'Failed to reschedule booking.',
  EXTEND_FAILED: 'Failed to extend booking.',
  DETAILS_FAILED: 'Failed to fetch booking details.',
  ADMIN_FETCH_FAILED: 'Failed to fetch admin bookings.',
  STYLIST_FETCH_FAILED: 'Failed to fetch stylist bookings.',
  LEAD_TIME_ERROR: 'Action must be performed at least 12 hours in advance.',
  RESCHEDULE_LIMIT_REACHED:
    'This booking has already been rescheduled and cannot be changed again.',
  STATUS_UPDATE_SUCCESS: 'Booking status updated.',
  STATUS_UPDATE_FAILED: 'Failed to update booking status.',
  TODAY_FETCH_FAILED: "Failed to fetch today's appointments.",
} as const;

export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
}

export const BOOKING_RULES = {
  LEAD_TIME_HOURS: 12,
  MAX_RESCHEDULES: 1,
} as const;
