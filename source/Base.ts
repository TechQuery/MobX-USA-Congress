import { HTTPClient } from 'koajax';

export const congressClient = new HTTPClient({
    baseURI: 'https://api.congress.gov/v3/',
    responseType: 'json'
});
