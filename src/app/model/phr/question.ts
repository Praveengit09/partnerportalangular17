import { ChoicesList } from "./choicesList"
import { Option } from "./option"

export class Question {

	public static COMPONENT_OPTION = 0; //1 dropdown ----------------------------------------0
	public static COMPONENT_OPTIONS = Question.COMPONENT_OPTION + 1; // 2 dropdown ----------1
	public static COMPONENT_ENTRY = Question.COMPONENT_OPTIONS + 1;// edit text -------------2
	public static COMPONENT_BARCODE_SCANNER = Question.COMPONENT_ENTRY + 1; //---------------3
	public static COMPONENT_SWITCH = Question.COMPONENT_BARCODE_SCANNER + 1;// yes/no--------4
	public static COMPONENT_MULTI_SELECTION = Question.COMPONENT_SWITCH + 1;// mutiple selection -----5

	public text: string;
	public desc: string;
	public isChecked: boolean;
	public view: string;
	public id: number;
	public ans: string;
	public componentId: number;
	public unit: string;
	public inputType: number;
	public maxLength: number;
	public questionType: string;
	public symptomName: string;
	public option: Option[] = new Array<Option>();
	public none: number;
	public choices: any;

	//loacl use
	public calcuatedAnswer:string;
	//Updated by
	public userId:number;
	public updatedTime:number;
}