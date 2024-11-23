# MobX-USA-Congress

[MobX][1] SDK for [USA Congress API][2], which is based on [MobX-RESTful][3].

[![MobX compatibility](https://img.shields.io/badge/Compatible-1?logo=mobx&label=MobX%206%2F7)][1]
[![NPM Dependency](https://img.shields.io/librariesio/release/npm/mobx-usa-congress)][4]
[![CI & CD](https://github.com/TechQuery/MobX-USA-Congress/actions/workflows/main.yml/badge.svg)][5]

[![NPM](https://nodei.co/npm/mobx-usa-congress.png?downloads=true&downloadRank=true&stars=true)][6]

## Model

1. [Congress](source/Congress.ts)
2. [Member](source/Member.ts)
3. [Hearing](source/Hearing.ts)
4. [Summary](source/Summary.ts)

## Usage

### Installation

```shell
npm i mobx-usa-congress
```

### `tsconfig.json`

```json
{
    "compilerOptions": {
        "target": "ES6",
        "moduleResolution": "Node",
        "useDefineForClassFields": true,
        "experimentalDecorators": false,
        "jsx": "react-jsx"
    }
}
```

### `model/Congress.ts`

```typescript
import { githubClient, CongressModel } from 'mobx-usa-congress';

// Any possible way to pass USA Congress API token
// from local files or back-end servers to Web pages
const token = new URLSearchParams(location.search).get('token');

congressClient.use(({ request }, next) => {
    if (token)
        request.headers = {
            authorization: `Bearer ${token}`,
            ...request.headers
        };
    return next();
});

export const congressStore = new CongressModel();
```

### `page/Congress.tsx`

Use [WebCell][7] as an Example

```tsx
import { Session } from 'mobx-usa-congress';
import { component, observer } from 'web-cell';

import { congressStore } from '../model/Congress';

@component({ tagName: 'congress-page' })
@observer
export class CongressPage extends HTMLElement {
    connectedCallback() {
        congressStore.getThisYearOne();
    }

    renderSession = ({
        type,
        number,
        chamber,
        startDate,
        endDate
    }: Session) => (
        <li key={chamber}>
            <code>{type}</code> #{number} {chamber} (
            <time dateTime={startDate}>
                {new Date(startDate).toLocaleString()}
            </time>{' '}
            ~{' '}
            <time dateTime={endDate}>{new Date(endDate).toLocaleString()}</time>
            )
        </li>
    );

    render() {
        const { thisYearOne } = congressStore;

        return (
            <main>
                <h1>USA Congress</h1>

                <section>
                    <h2>
                        {thisYearOne?.name} ({thisYearOne?.startYear} ~{' '}
                        {thisYearOne?.endYear})
                    </h2>
                    <h3>sessions</h3>
                    <ul>{thisYearOne?.sessions.map(this.renderSession)}</ul>
                </section>
            </main>
        );
    }
}
```

[1]: https://mobx.js.org/
[2]: https://github.com/LibraryOfCongress/api.congress.gov
[3]: https://github.com/idea2app/MobX-RESTful
[4]: https://libraries.io/npm/mobx-usa-congress
[5]: https://github.com/TechQuery/MobX-USA-Congress/actions/workflows/main.yml
[6]: https://nodei.co/npm/mobx-usa-congress/
[7]: https://github.com/EasyWebApp/WebCell
