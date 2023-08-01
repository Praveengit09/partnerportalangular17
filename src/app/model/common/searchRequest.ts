export class SearchRequest {
    public aliasSearchType: number;
    public from: number;
    public id: number;
    public pocId: number;
    public pocName: string;
    public searchCriteria: number;
    public searchTerm: string;
    public size: number;
    public scheduleId: number;
    public homeCollections: boolean = false;
    public city: string;
    public brandId: number;
    public privilegeType: number;
}