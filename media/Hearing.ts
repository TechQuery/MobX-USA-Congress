import { ListModel, Stream, toggle } from 'mobx-restful';

import {
    Base,
    Chamber,
    congressClient,
    CongressID,
    createListStream
} from './Base';
import { Committee } from './Committee';

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

export class HearingModel
    extends Stream<Hearing>(ListModel)
    implements CongressID
{
    baseURI = 'hearing';
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

    openStream = createListStream<Hearing>()('hearings');

    @toggle('downloading')
    async getOne(jacketNumber: number) {
        console.assert(
            !!(this.congress && this.chamber),
            'Congress & Chamber parameters are required'
        );
        const { body } = await this.client.get<{ hearing: Hearing }>(
            `${this.baseURI}/${jacketNumber}`
        );
        return (this.currentOne = body!.hearing);
    }
}
