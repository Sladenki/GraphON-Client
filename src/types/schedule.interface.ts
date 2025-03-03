export interface ScheduleItem {
    _id: string;
    name: string;
    type: 'lecture' | 'practice';
    roomNumber: number;
    dayOfWeek: number;
    timeFrom: string;
    timeTo: string;
    graphId: {
      name: string;
    };
}
  
export interface EventItem {
    _id: string;
    name: string;
    description: string;
    eventDate: string;
    timeFrom: string;
    timeTo: string;
    graphId: {
      name: string;
    };
}