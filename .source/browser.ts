// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "main-page.mdx": () => import("../content/docs/main-page.mdx?collection=docs"), "notifications.mdx": () => import("../content/docs/notifications.mdx?collection=docs"), }),
};
export default browserCollections;