export class BufferConditions {
    public id: number;
    public gt: number;
    public gte: number;
    public lt: number;
    public lte: number;
    public eq: number;
    public defaultValue: number;
    public value: number;
    public condition: BufferConditions;

    // local purpose
    public bufferType: any;
    public showOnlyBufferTime: boolean = true;
    public timeValue: number;
}