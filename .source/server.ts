// @ts-nocheck
import * as __fd_glob_2 from "../content/docs/notifications.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/main-page.mdx?collection=docs"
import * as __fd_glob_0 from "../content/docs/index.mdx?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {}, {"index.mdx": __fd_glob_0, "main-page.mdx": __fd_glob_1, "notifications.mdx": __fd_glob_2, });