import { ListModel, Stream } from 'mobx-restful';

import { Base, congressClient, createListStream } from './Base';
import { Bill } from './Bill';

export interface Summary
    extends Base,
        Record<
            | 'versionCode'
            | `currentChamber${'' | 'Code'}`
            | `action${'Date' | 'Desc'}`
            | 'lastSummaryUpdateDate'
            | 'text',
            string
        > {
    bill: Bill;
}

export class SummaryModel extends Stream<Summary>(ListModel) {
    baseURI = 'summaries';
    client = congressClient;

    constructor(
        public congress?: number,
        public billType?: Bill['type']
    ) {
        super();

        if (congress) this.baseURI += `/${congress}`;
        if (billType) this.baseURI += `/${billType}`;
    }

    openStream = createListStream<Summary>()('summaries');
}