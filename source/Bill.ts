import { ListModel, Stream, toggle } from 'mobx-restful';

import {
    Base,
    congressClient,
    createListStream,
    ItemLink,
    ListLink
} from './Base';
import { Member } from './Member';

export interface Sponsor
    extends Pick<
            Member,
            | 'bioguideId'
            | 'district'
            | 'firstName'
            | 'lastName'
            | 'state'
            | 'url'
        >,
        Record<`${'full' | 'middle'}Name` | 'party', string> {
    isByRequest: 'N';
}

export type CostEstimate = Record<
    'title' | 'description' | 'pubDate' | 'url',
    string
>;

export interface BillRelations
    extends Record<
        | 'titles'
        | 'subjects'
        | 'committees'
        | 'textVersions'
        | 'actions'
        | 'amendments'
        | 'relatedBills'
        | 'summaries',
        ListLink
    > {
    sponsors?: Sponsor[];
    cosponsors?: ListLink & { countIncludingWithdrawnCosponsors: number };
    committeeReports?: ItemLink[];
    laws?: Record<'type' | 'number', string>[];
    cboCostEstimates?: CostEstimate[];
}

export interface Bill
    extends Base,
        Record<
            | 'number'
            | 'title'
            | `originChamber${'' | 'Code'}`
            | 'updateDateIncludingText',
            string
        >,
        Partial<BillRelations> {
    type: 'hr' | 's' | `${'h' | 's'}${'' | 'j' | 'con'}res`;
    congress: number;
    policyArea?: { name: string };
    constitutionalAuthorityStatementText?: string;
    introducedDate?: string;
    latestAction?: Record<'actionDate' | 'text', string>;
}

export interface BillOption {
    congress?: number;
    billType?: Bill['type'];
}

export class BillModel extends Stream<Bill>(ListModel) implements BillOption {
    baseURI = 'bill';
    client = congressClient;

    congress?: number;
    billType?: Bill['type'];

    constructor({ congress, billType }: BillOption = {}) {
        super();

        if (congress) {
            this.congress = congress;
            this.baseURI += `/${congress}`;
        }
        if (billType) {
            this.billType = billType;
            this.baseURI += `/${billType}`;
        }
    }

    openStream = createListStream<Bill>()('bills');

    @toggle('downloading')
    async getOne(billNumber: string) {
        console.assert(
            !!(this.congress && this.billType),
            'Congress & Bill Type parameters are required'
        );
        const { body } = await this.client.get<{ bill: Bill }>(
            `${this.baseURI}/${billNumber}`
        );
        return (this.currentOne = body!.bill);
    }
}
