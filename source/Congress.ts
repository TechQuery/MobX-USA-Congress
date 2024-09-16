import { observable } from 'mobx';
import { ListModel, Stream, toggle } from 'mobx-restful';
import { buildURLData } from 'web-utility';

import { congressClient } from './Base';

export interface Session
    extends Record<'chamber' | 'startDate' | 'endDate', string> {
    type: 'R';
    number: number;
}

export interface Congress
    extends Record<'name' | 'startYear' | 'endYear', string>,
        Partial<Record<'updateDate' | 'url', string>> {
    sessions: Session[];
}

export class CongressModel extends Stream<Congress>(ListModel) {
    baseURI = 'congress';
    client = congressClient;

    @observable
    accessor thisYearOne: Congress | undefined;

    async *openStream() {
        var totalCount = 0;

        for (let pageIndex = 1, pageSize = 10; ; pageIndex++) {
            const { body } = await this.client.get<{ congresses: Congress[] }>(
                `${this.baseURI}?${buildURLData({
                    offset: (pageIndex - 1) * pageSize,
                    limit: pageSize
                })}`
            );
            const { congresses } = body!;

            if (!congresses[0]) break;

            totalCount += congresses.length;

            yield* congresses;

            if (congresses.length < pageSize) break;
        }

        this.totalCount = totalCount;
    }

    @toggle('downloading')
    async getOne(id: number) {
        const { body } = await this.client.get<{ congress: Congress }>(
            `${this.baseURI}/${id}`
        );
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
