export const BOOKING_MESSAGES = {
  CREATE_SUCCESS: 'Your appointment has been successfully booked.',
  CANCEL_SUCCESS: 'Your booking has been cancelled successfully.',
  RESCHEDULE_SUCCESS: 'Your booking has been rescheduled successfully.',

  FETCH_FAILED: 'Failed to fetch bookings.',
  CREATE_FAILED: 'Failed to create booking.',
  CANCEL_FAILED: 'Failed to cancel booking.',
  RESCHEDULE_FAILED: 'Failed to reschedule booking.',

  DETAILS_FAILED: 'Failed to fetch booking details.',
  ADMIN_FETCH_FAILED: 'Failed to fetch admin bookings.',
  STYLIST_FETCH_FAILED: 'Failed to fetch stylist bookings.',
  LEAD_TIME_ERROR: 'Action must be performed at least 12 hours in advance.',
  RESCHEDULE_LIMIT_REACHED:
    'This booking has already been rescheduled and cannot be changed again.',
  STATUS_UPDATE_SUCCESS: 'Booking status updated.',
  STATUS_UPDATE_FAILED: 'Failed to update booking status.',
  TODAY_FETCH_FAILED: "Failed to fetch today's appointments.",
  FETCH_STATS_FAILED: 'Failed to fetch dashboard statistics.',
  APPLY_COUPON_FAILED: 'Failed to apply coupon.',
  REMOVE_COUPON_FAILED: 'Failed to remove coupon.',
} as const;

export enum BookingStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  FAILED = 'FAILED',
  BLOCKED = 'BLOCKED',
  SPECIAL = 'SPECIAL',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  ADVANCE_PAID = 'ADVANCE_PAID',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export const BOOKING_RULES = {
  LEAD_TIME_HOURS: 12,
  MAX_RESCHEDULES: 1,
} as const;
