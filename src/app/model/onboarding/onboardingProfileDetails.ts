import { ProfileDetailsVO } from './../../model/profile/profileDetailsVO';
import { OnboardingUserVO } from './onboardingUserVO';
import { DeliveryAddress } from './deliveryAddress';
export class OnboardingProfileDetails extends OnboardingUserVO{
    public profile:ProfileDetailsVO;
    public deliveryAddress:DeliveryAddress;
}
