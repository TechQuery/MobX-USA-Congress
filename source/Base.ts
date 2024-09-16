import { HTTPClient } from "koajax";

export const client = new HTTPClient({
  baseURI: "https://api.congress.gov/v3/",
  responseType: "json",
});
