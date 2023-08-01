export class SymptomBaseResponse {
    public id: number;
    public title: String;
    public name: String;
    public medicationType: Array<MedicationType>;  //medicationType
    public imageResponseList: Array<ImageResponse>  //imageUrl
}
export class MedicationType {
    public id: number
    public title: String
}
export class ImageResponse {
    public id: number
    public url: String

}
