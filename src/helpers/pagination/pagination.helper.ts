interface PaginationMeta {
    totalItems: number;
    totalPages: number;
    limit: number;
    page: number;
}

export interface PaginatedResult<T> {
    items: T[];
    meta: PaginationMeta;
}

/**
 * Asynchronously paginates data retrieved from a Prisma model.
 * @template T The type of data being paginated.
 * @param where Optional filter criteria for the query (Prisma `where` clause).
 * @param page The current page number (default: 1). Must be a positive integer.
 * @returns A Promise resolving to a `PaginatedResult` object containing the paginated items and metadata.
 * @throws {Error} If `page` or `limit` are not positive integers.
 *
 * @example
 * const users = await paginate(prisma.user, { isActive: true }, { name: 'asc' }, 2, 10);
 */
export async function paginate<T>(
    prismaModel:
        {
            findMany:
            (args: any) => Promise<T[]>;
            count: (args: any) => Promise<number>;
        },
    where: any,
    orderBy: any,
    page: number = 1,
    limit: number = 20
): Promise<PaginatedResult<T>> {

    if (!Number.isInteger(page) || page <= 0) {
        throw new Error("Page must be a positive integer.");
    }

    if (!Number.isInteger(limit) || limit <= 0) {
        throw new Error("Limit must be a positive integer.");
    }

    const [items, totalItems] = await Promise.all([
        prismaModel.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        }),
        prismaModel.count({ where }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return {
        items,
        meta: {
            totalItems,
            totalPages,
            limit,
            page,
        },
    };
}