import { Tag } from './tag';
import { Share } from './share';

export interface Dashboard {
  id?: string,
  name?: string,
  charts: Chart[],
  shares: Share[]
}

export interface Chart {
  id?: string,
  name?: string,
  groupBy: string,
  metric: string,
  includedTags: Tag[]
}
