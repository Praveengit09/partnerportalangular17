import { AccessPermission } from './accesspermission';

export class POCPermission {
    public pocId: number;
    public roleIdList: Array<number>;
    public permissionList: Array<AccessPermission>;
}