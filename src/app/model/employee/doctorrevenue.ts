import{ ChartCoordinate } from './../../model/chart/chartCoordinate'
export class DoctorRevenue{
    public doctorId:number;
    public doctorTitle:string;
    public doctorFirstName:string;
    public doctorLastname:string;
    public values : ChartCoordinate[] = new Array<ChartCoordinate>();
}
