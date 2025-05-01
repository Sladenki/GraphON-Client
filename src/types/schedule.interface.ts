export enum ScheduleType {
    LECTURE = 'lecture',
    PRACTICE = 'practice',
}

export interface ScheduleItem {
    _id: string;
    name: string;
    type: ScheduleType;
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
    isAttended?: boolean;
}

export interface ISchedule {
    id: string;
    graphId: string;
    name: string;
    type: ScheduleType;
    roomNumber: number;
    dayOfWeek: number;
    timeFrom: string;
    timeTo: string;
    createdAt: string;
    updatedAt: string;
}