import { HTTPClient } from 'koajax';
import { DataObject, ListModel } from 'mobx-restful';
import { buildURLData } from 'web-utility';

export const congressClient = new HTTPClient({
    baseURI: 'https://api.congress.gov/v3/',
    responseType: 'json'
});

export type Base = Record<'updateDate' | 'url', string>;

export const createListStream =
    <D extends DataObject>() =>
    <K extends string>(key: K) =>
        async function* openStream(this: ListModel<D>) {
            var totalCount = 0;

            for (let pageIndex = 1, pageSize = 10; ; pageIndex++) {
                const { body } = await this.client.get<Record<K, D[]>>(
                    `${this.baseURI}?${buildURLData({
                        offset: (pageIndex - 1) * pageSize,
                        limit: pageSize
                    })}`
                );
                const list = body![key];

                if (!list[0]) break;

                totalCount += list.length;

                yield* list;

                if (list.length < pageSize) break;
            }

            this.totalCount = totalCount;
        };
