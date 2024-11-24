import { ListModel, Stream, toggle } from 'mobx-restful';

import {
    Base,
    Chamber,
    congressClient,
    CongressID,
    createListStream,
    ItemLink,
    ListLink
} from '../Base';
import { Bill } from '../Bill';
import { BaseCommittee } from './index';

export interface CommitteePrint
    extends Base,
        Partial<ItemLink>,
        Required<CongressID> {
    jacketNumber: 48144;
    number?: string;
    title?: string;
    text?: ListLink;
    committees?: BaseCommittee[];
    associatedBills?: Pick<Bill, 'congress' | 'number' | 'type' | 'url'>[];
}

export type PrintType =
    | `Formatted ${'Text' | 'XML'}`
    | 'Generated HTML'
    | 'PDF';

export interface CommitteePrintText {
    type: PrintType;
    url: string;
}

export class CommitteePrintModel
    extends Stream<CommitteePrint>(ListModel)
    implements CongressID
{
    baseURI = 'committee-print';
    client = congressClient;

    congress?: number;
    chamber?: Chamber;

    constructor({ congress, chamber }: CongressID = {}) {
        super();

        if (congress) {
            this.congress = congress;
            this.baseURI += `/${congress}`;
        }
        if (chamber) {
            this.chamber = chamber;
            this.baseURI += `/${chamber}`;
        }
    }

    openStream = createListStream<CommitteePrint>()('committeePrints');

    @toggle('downloading')
    async getOne(jacketNumber: number) {
        console.assert(
            !!(this.congress && this.chamber),
            'Congress & Chamber parameters are required'
        );
        const { body } = await this.client.get<{
            committeePrint: CommitteePrint;
        }>(`${this.baseURI}/${jacketNumber}`);

        return (this.currentOne = body!.committeePrint);
    }

    @toggle('downloading')
    async getOneText(jacketNumber: number, type: PrintType) {
        console.assert(
            !!(this.congress && this.chamber),
            'Congress & Chamber parameters are required'
        );
        const { body } = await this.client.get<{ text: CommitteePrintText[] }>(
            `${this.baseURI}/${jacketNumber}/text`
        );
        return body!.text.find(({ type: t }) => t === type)?.url;
    }
}
