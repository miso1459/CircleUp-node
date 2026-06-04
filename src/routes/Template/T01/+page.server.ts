import { getTemplates } from '$lib/server/services/template-01.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const searchParam = url.searchParams.get('search');
	const search = searchParam || undefined;

	const pageParam = url.searchParams.get('page');
	const parsedPage = pageParam ? Number(pageParam) : NaN;
	const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

	try {
		const result = await getTemplates({ search, page, pageSize: 20 });

		return {
			items: result.data,
			total: result.total,
			totalPages: result.totalPages,
			page: result.page,
			search: searchParam ?? null,
			error: null
		};
	} catch {
		return {
			items: [],
			total: 0,
			totalPages: 0,
			page: 1,
			search: searchParam ?? null,
			error: '데이터를 불러오는 중 오류가 발생했습니다.'
		};
	}
};
