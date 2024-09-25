import { Base } from './Base';

export interface Bill
    extends Base,
        Record<
            | 'number'
            | 'title'
            | `originChamber${'' | 'Code'}`
            | 'updateDateIncludingText',
            string
        > {
    type: 'hr' | 's' | `${'h' | 's'}${'' | 'j' | 'con'}res`;
    congress: number;
}
