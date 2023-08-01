import { HsWalletHistory } from './walletHistory';

export class WalletDetails {
    public profileId: number;
    public walletBalance: number;
    public postWalletBalance: number;
    public hsWalletHistory: HsWalletHistory[] = new Array<HsWalletHistory>();
}