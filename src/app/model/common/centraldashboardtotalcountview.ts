import { DashboardViewVo } from './dashboardviewvo' ;
import { TurnAroundTimeVo } from './turnaroundtimevo' ;

export class CentralDashboardTotalCountView {
    public  totalOrderCount :number;
    public  totalConsumerInteractedCount :number;
    public  totalConsumerInteractedPendingCount :number;
    public  totalOrderInteractedCount :number;
    public  totalOrderInteractedPendingCount :number;
    public  totalPrescriptionsCount :number;
    public  totalOrderCompletedCount :number;
    public  totalOrderPendingCount :number;
    public  totalOrderCanclingCount :number;
    public  listCentralDashboardViewVo:DashboardViewVo[] = new Array<DashboardViewVo>() ;
    public  totalOnBoardingTurnAroundTime :number;
    public  totalDoctorTurnAroundTime :number;
    public  totalDoctorConsumerInteractedTATAvg :number;
    public  totalDiagnosticTurnAroundTime :number;
    public  totalDiagnosticsConsumerInteractedTATAvg :number;
    public  listOfTurnAroundTime :TurnAroundTimeVo[] = new Array<TurnAroundTimeVo>();
}