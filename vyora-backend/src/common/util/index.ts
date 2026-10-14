import { Request } from 'express';

export function parsePagingQuery(req: Request) {
  const query = req.query || {};
  const body = req.body || {};

  const pageIndexRaw = body.page_index ?? query.page_index ?? query.page;
  const pageSizeRaw = body.page_size ?? query.page_size ?? query.limit;
  const skipRaw = query.skip;

  const limit = pageSizeRaw ? parseInt(String(pageSizeRaw), 10) : 50;
  let skip = 0;

  if (skipRaw !== undefined) {
    skip = parseInt(String(skipRaw), 10);
  } else if (pageIndexRaw !== undefined) {
    const pageIndex = Math.max(1, parseInt(String(pageIndexRaw), 10));
    skip = (pageIndex - 1) * limit;
  }

  const search = (body.global_value ?? query.search ?? query.global_value ?? '') as string;
  const sortBy = (body.sort_by ?? query.sortBy ?? query.sort_by) as string | undefined;
  const sortOrder = (body.sort_order ?? query.sortOrder ?? query.sort_order) as 'asc' | 'desc' | undefined;

  return {
    limit,
    skip,
    page: pageIndexRaw ? parseInt(String(pageIndexRaw), 10) : Math.floor(skip / limit) + 1,
    search: search ? String(search).trim() : undefined,
    sortBy,
    sortOrder,
    advanceFilters: body.advance_filters || [],
  };
}
