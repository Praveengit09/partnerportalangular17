import { CartItem } from './cartitem';

export class CreditMemo extends CartItem {
    public memoId: string;
    public memoStatus: number;
}