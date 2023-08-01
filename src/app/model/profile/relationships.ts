
export class Relationship {
    public static SELF: number = 0;
    public static SPOUSE: number = Relationship.SELF + 1;
    public static MOTHER: number = Relationship.SPOUSE + 1;
    public static FATHER: number = Relationship.MOTHER + 1;
    public static DAUGHTER: number = Relationship.FATHER + 1;
    public static SON: number = Relationship.DAUGHTER + 1;
    public static MOTHERINLAW: number = Relationship.SON + 1;
    public static FATHERINLAW: number = Relationship.MOTHERINLAW + 1;
    public static SIBLING: number = Relationship.FATHERINLAW + 1;
    public static GRANDMOTHER: number = Relationship.SIBLING + 1;
    public static GRANDFATHER: number = Relationship.GRANDMOTHER + 1;
    public static DAUGHTERINLAW: number = Relationship.GRANDFATHER + 1;
    public static SONINLAW: number = Relationship.DAUGHTERINLAW + 1;
    public static Others: number = Relationship.SONINLAW + 1;

}