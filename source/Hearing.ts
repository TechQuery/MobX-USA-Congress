import { ListModel, Stream, toggle } from 'mobx-restful';

import { Base, congressClient, createListStream } from './Base';
import { Committee } from './Committee';
import { Chamber } from './Congress';

export interface Hearing
    extends Base,
        Record<'congress' | 'jacketNumber', number> {
    chamber: Chamber;
    libraryOfCongressIdentifier?: string;
    citation?: string;
    associatedMeeting?: Record<'eventId' | 'url', string>;
    committees?: Committee[];
    formats?: Record<'type' | 'url', string>[];
    dates?: { date: string }[];
}

export class HearingModel extends Stream<Hearing>(ListModel) {
    baseURI = 'hearing';
    client = congressClient;

    constructor(
        public congress?: number,
        public chamber?: Chamber
    ) {
        super();

        if (congress) this.baseURI += `/${congress}`;
        if (chamber) this.baseURI += `/${chamber}`;
    }

    openStream = createListStream<Hearing>()('hearings');

    @toggle('downloading')
    async getOne(jacketNumber: number) {
        if (!this.congress || !this.chamber)
            throw new ReferenceError('Congress & Chamber are required');

        const { body } = await this.client.get<{ hearing: Hearing }>(
            `${this.baseURI}/${jacketNumber}`
        );
        return (this.currentOne = body!.hearing);
    }
}
