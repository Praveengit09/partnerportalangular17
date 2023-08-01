export class Region {
    public id: number;
    public mode: number

    public static MODE_FOR_COUNTRY = 1;
    public static MODE_FOR_REGION = 2;
    public static MODE_FOR_STATE = 4;
    public static MODE_FOR_CITY = 3;
    public static MODE_FOR_AREA = 5;
}