import { PocDetail } from "../poc/pocDetails";

export class FavouritePartners {
  public subTypeId: number;
  public preferred: boolean;
  public details: PocDetail;
  public Type: string;
  public pharmacyHomeOrderDefault: boolean;
	public diagnosticHomeOrderDefault: boolean;
}
