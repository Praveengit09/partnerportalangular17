import { RegistrationVO } from './registrationVO';
import { QualificationAndSpecialityBase } from './../../model/employee/qualificationAndSpecialityBase';
export class RegistrationResponseVo extends RegistrationVO {

	public authenticType: number;
	public statesandcities: Map<Object, Object>[];

	public goalManagementList: Map<Object, Object>[];
	public serviceLine: string = "";
	public serviceLineType: string = "";
	public topics: Array<string>;
	public symptomList: Map<Object, Object>[];
	public expertTypeList: Array<QualificationAndSpecialityBase>;
	public AwsRegion: string;
	public AwsBucketUrl: string;
	public AwsBucketName: string;
}
