import { ChartCoordinate } from './../../model/chart/chartCoordinate'

export class DashBoardChartResp {
    public key: string;
    public id: number;
    public values: ChartCoordinate[] = new Array<ChartCoordinate>();
}
