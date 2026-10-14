import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, statusCode = 200) {
    return res.status(statusCode).json(data);
  }

  static created<T>(res: Response, data: T) {
    return res.status(201).json(data);
  }

  static paginated<T>(
    res: Response,
    items: T[],
    total: number,
    limit: number,
    skip: number,
  ) {
    const pageIndex = limit > 0 ? Math.floor(skip / limit) + 1 : 1;
    return res.status(200).json({
      items,
      total,
      list: items,
      count: total,
      page_index: pageIndex,
      page_size: limit,
      limit,
      skip,
    });
  }
}
