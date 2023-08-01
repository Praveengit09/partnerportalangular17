import { AccessPermission } from './accesspermission';

export class Role {

	public static ACCESS_TYPE_NOT_DECIDED: number = 0;
	public static ACCESS_TYPE_VIEW: number = Role.ACCESS_TYPE_NOT_DECIDED + 1;
	public static ACCESS_TYPE_MODIFY: number = Role.ACCESS_TYPE_VIEW + 1;
	public static ACCESS_TYPE_ADD_EMPLOYEE: number = Role.ACCESS_TYPE_MODIFY + 1;

	public roleId: number;
	public roleName: string;
	public description: string;
	public type: number;
	public permissions: Array<AccessPermission>;
	public visibility: boolean;
	public updatedTime: number;
}