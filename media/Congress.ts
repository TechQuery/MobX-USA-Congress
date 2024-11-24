import { observable } from 'mobx';
import { ListModel, Stream, toggle } from 'mobx-restful';

import { Base, Chamber, congressClient, createListStream } from './Base';
import { Term } from './Member';
import { SummaryModel } from './Summary';

export interface Session extends Record<'startDate' | 'endDate', string> {
    type: 'R';
    number: number;
    chamber: Chamber;
}

export interface Congress
    extends Base,
        Required<Pick<Term, 'startYear' | 'endYear'>> {
    name: string;
    sessions: Session[];
}

export class CongressModel extends Stream<Congress>(ListModel) {
    baseURI = 'congress';
    client = congressClient;

    @observable
    accessor thisYearOne: Congress | undefined;

    @observable
    accessor currentSummary: SummaryModel | undefined;

    openStream = createListStream<Congress>()('congresses');

    @toggle('downloading')
    async getOne(congress: number) {
        const { body } = await this.client.get<{ congress: Congress }>(
            `${this.baseURI}/${congress}`
        );
        this.currentSummary = new SummaryModel({ congress });

        return (this.currentOne = body!.congress);
    }

    @toggle('downloading')
    async getThisYearOne() {
        const { body } = await this.client.get<{ congress: Congress }>(
            `${this.baseURI}/current`
        );
        return (this.thisYearOne = body!.congress);
    }
}
