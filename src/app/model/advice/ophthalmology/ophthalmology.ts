import { OcularExamination } from "./ocularexamination";
import { EyePower } from "./eyepower";
export class Ophthalmology {

    public left: EyePower = new EyePower();
    public right: EyePower = new EyePower();

    public presentGlassesDuration: number;

    // Ocular Examination / Moments
    public oe:OcularExamination = new OcularExamination();

}