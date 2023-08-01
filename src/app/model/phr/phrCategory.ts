import { PhrQuestion } from './phrQuestion'

export class PhrCategory {
    public title: string;
    public description: string;
    public iconUrl: string;
    public activities: PhrQuestion[] = new Array<PhrQuestion>();
}