export const MEETING_DAYS = [
  'SATURDAY',
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
] as const;

export type MeetingDay = (typeof MEETING_DAYS)[number];
