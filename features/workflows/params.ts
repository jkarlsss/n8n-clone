import { parseAsInteger, parseAsString } from "nuqs/server";
import { PAGINATION } from "@/config/constants";

export const workflowsParams = {
  page: parseAsInteger
  .withDefault(PAGINATION.DEFAULT_PAGE)
  .withOptions({ clearOnDefault: false }),
  pageSize: parseAsInteger.withDefault(PAGINATION.DEFAULT_PAGE_SIZE),
  search: parseAsString
  .withDefault("")
  .withOptions({ clearOnDefault: false }),
}