import { FavouritePartners } from './favouritePartners';


export class DoctorFavouritePartnerRequest {
    public doctorId: number;
    public partnerDetails: Array<FavouritePartners> = new Array();

}