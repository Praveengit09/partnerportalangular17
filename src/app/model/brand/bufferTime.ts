import { BufferConditions } from './bufferConditions';

export class BufferTime {
    public appId: number;
    public bookingType: number;
    public bookingSubType: number;
    public conditions: Array<BufferConditions>;
}