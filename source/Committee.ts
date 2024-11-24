import { ListModel, Stream, toggle } from 'mobx-restful';

import {
    Chamber,
    congressClient,
    CongressID,
    createListStream,
    ListLink
} from './Base';

export type BaseCommittee = Record<'systemCode' | 'name' | 'url', string>;

export interface CommitteeHistory
    extends Record<
        `${'libraryOfCongress' | 'official'}Name` | `${'start' | 'update'}Date`,
        string
    > {
    endDate?: string;
}

export interface Committee extends BaseCommittee {
    chamber: Chamber;
    committeeTypeCode: 'Standing';
    updateDate: string;
    history: CommitteeHistory[];
    isCurrent?: boolean;
    communications?: ListLink;
    reports?: ListLink;
    bills?: ListLink;
    parent?: BaseCommittee;
    subcommittees: BaseCommittee[];
}

export class CommitteeModel
    extends Stream<Committee>(ListModel)
    implements CongressID
{
    baseURI = 'committee';
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

    openStream = createListStream<Committee>()('committees');

    @toggle('downloading')
    async getOne(committeeCode: string) {
        console.assert(!!this.chamber, 'Chamber parameter is required');

        const { body } = await this.client.get<{ committee: Committee }>(
            `${this.baseURI}/${committeeCode}`
        );
        return (this.currentOne = body!.committee);
    }
}
