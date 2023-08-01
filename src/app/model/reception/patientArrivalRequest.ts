import { DoctorAppointmentDetails } from './doctorAppointmentDetails';
import { PatientVitalInfo } from './../../model/phr/patientVitalInfo';

export class PatientArrivalRequest{
    public doctorDailyAppointment : DoctorAppointmentDetails;
    public patientVitalInformation : PatientVitalInfo;
}
