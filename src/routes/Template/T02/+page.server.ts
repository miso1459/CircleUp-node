import { getTemplates } from '$lib/server/services/template-02.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const searchParam = url.searchParams.get('search');
	const search = searchParam || undefined;

	const startDateParam = url.searchParams.get('startDate');
	const endDateParam = url.searchParams.get('endDate');

	const pageParam = url.searchParams.get('page');
	const parsedPage = pageParam ? Number(pageParam) : NaN;
	const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

	const result = await getTemplates({ search, page, pageSize: 20 });

	return {
		items: result.data,
		total: result.total,
		totalPages: result.totalPages,
		page: result.page,
		search: searchParam ?? null,
		startDate: startDateParam ?? null,
		endDate: endDateParam ?? null
	};
};