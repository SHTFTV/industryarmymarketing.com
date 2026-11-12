export function homepageJournal<T extends {slug:string;title:string;image:string;publishedAt?:string}>(posts:T[],now?:number):T[];
export function homepagePublicationLabel(publishedAt:string|undefined):string;
