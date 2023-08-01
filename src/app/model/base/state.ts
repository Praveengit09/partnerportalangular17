import {City} from './city';

export class State{
    public id: number;  
    public state: string;
    public active: boolean;
    public cities: Array<City>;
}