export class SymptomQuestionnaireItemResponse {
    public answerKey: Array<string>;
    public isLeaf: number = 0;
    public isMultipleChoice: number = 0;
    public questions: Array<Question>;
    public answers: Array<SymptomQuestionnaireItemResponse>;
    public lastAnswers: Array<SelectedId>;
    public questionsToDisplay: Array<Question>;
}

export class Question {
    public id: string;
    public symptomName: string;
    public option: Array<Option>;
    public none: number = 0;
    public isSelected: boolean;
}

export class Option {
    public optionId: string;
    public optionValue: string;
}

export class SelectedId {
    public selectedId: Array<string>;
}