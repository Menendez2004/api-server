/**
 * Interface defining the metadata for pagination.
 */
interface PaginationMeta {
    /**
     * The total number of items available.
     */
    totalItems: number;
    /**
     * The total number of pages based on the current limit.
     */
    totalPages: number;
    /**
     * The maximum number of items per page.
     */
    limit: number;
    /**
     * The current page number (1-based index).
     */
    page: number;
}

/**
 * Interface representing a paginated result, containing the items and pagination metadata.
 * @template T The type of items in the result.
 */
export interface PaginatedResult<T> {
    /**
     * The array of items for the current page.
     */
    items: T[];
    /**
     * The pagination metadata.
     */
    meta: PaginationMeta;
}

/**
 * Asynchronously paginates data retrieved from a Prisma model.
 * @template T The type of data being paginated.
 * @param prismaModel An object containing `findMany` and `count` methods from a Prisma model.
 * @param where Optional filter criteria for the query (Prisma `where` clause).
 * @param orderBy Optional sorting criteria for the query (Prisma `orderBy` clause).
 * @param page The current page number (default: 1). Must be a positive integer.
 * @param limit The maximum number of items per page (default: 20). Must be a positive integer.
 * @returns A Promise resolving to a `PaginatedResult` object containing the paginated items and metadata.
 * @throws {Error} If `page` or `limit` are not positive integers.
 *
 * @example
 * const users = await paginate(prisma.user, { isActive: true }, { name: 'asc' }, 2, 10);
 * console.log(users.items); // Array of users on page 2
 * console.log(users.meta); // Pagination metadata
 */
export async function paginate<T>(
    prismaModel: { findMany: (args: any) => Promise<T[]>; count: (args: any) => Promise<number>; },
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