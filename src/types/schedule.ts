export interface ScheduleItem {
  _id: string;
  dayOfWeek: number;
  timeFrom: string;
  timeTo: string;
  name: string;
  type: string;
  roomNumber: string;
}

export interface EventItem {
  _id: string;
  graphId?: {
    _id: string;
    name: string;
  };
  eventDate: string;
  name: string;
  timeFrom: string;
  timeTo: string;
  description: string;
  place: string;
  location?: string;
  regedUsers: number;
  isAttended: boolean;
}

export interface Schedule {
  schedule: ScheduleItem[];
  events: EventItem[];
} 