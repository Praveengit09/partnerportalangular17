export class UserPermissions {

    subPermissions: Array<UserPermissions>;

    constructor(public label: String,
        public path: String,
        public isNavigation: boolean,
        public permission: number,
        public accessRight: number,
        public navigationStyle: String,
        public priority: number
    ) { }

}