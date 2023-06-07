import { Tag } from './tag';

export interface Dashboard {
  id?: string,
  name?: string,
  charts: Chart[]
}

export interface Chart {
  name?: string,
  groupBy: string,
  metric: string,
  includedTags: Tag[]
}
