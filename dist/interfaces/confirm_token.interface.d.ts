import { ID } from '@directus/sdk';
export interface IConfirmToken {
    id: ID;
    Token: string;
    Payload: object;
    date_created: number;
    date_updated: number;
}
