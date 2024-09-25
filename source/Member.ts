import { ListModel, Stream, toggle } from 'mobx-restful';

import { Base, congressClient, createListStream } from './Base';

export type Depiction = Record<'attribution' | 'imageUrl', string>;

export interface Leadership {
    type: string;
    congress: number;
}

export interface PartyHistory
    extends Record<`party${'Name' | 'Abbreviation'}`, string> {
    startYear: number;
}

export interface Term
    extends Record<'congress' | 'startYear' | 'endYear', number>,
        Record<`state${'Code' | 'Name'}`, string> {
    chamber: 'House' | 'Senate';
    memberType: 'Senator';
}

export interface MemberBase
    extends Base,
        Record<'bioguideId' | 'name' | 'partyName' | 'state', string> {
    district?: string;
    depiction: Depiction;
    terms: { item: Term[] };
}

export interface MemberProfile
    extends Record<
        `${'first' | 'last' | 'honorific' | `${'direct' | 'inverted'}Order`}Name`,
        string
    > {
    birthYear: string;
}

export interface MemberResume
    extends Record<
        `${'' | 'co'}sponsoredLegislation`,
        { count: number; url: string }
    > {
    leadership: Leadership[];
    partyHistory: PartyHistory[];
}

export type Member = MemberBase & Partial<MemberProfile & MemberResume>;

export interface MemberOption {
    congress?: number;
    stateCode?: string;
    district?: string;
}

export class MemberModel extends Stream<Member>(ListModel) {
    baseURI = 'member';
    client = congressClient;

    constructor({ congress, stateCode, district }: MemberOption = {}) {
        super();

        if (congress) this.baseURI += `/congress/${congress}`;

        if (stateCode) {
            this.baseURI += `/${stateCode}`;

            if (district) this.baseURI += `/${district}`;
        }
    }

    openStream = createListStream<Member>()('members');

    @toggle('downloading')
    async getOne(bioguideId: number) {
        const { body } = await this.client.get<{ member: Member }>(
            `${this.baseURI}/${bioguideId}`
        );
        return (this.currentOne = body!.member);
    }
}
