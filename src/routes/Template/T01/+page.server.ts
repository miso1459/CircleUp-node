import { getTemplates } from '$lib/server/services/template-01.service';
import { getAllMenus } from '$lib/server/services/menu.service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const searchParam = url.searchParams.get('search');
	const search = searchParam || undefined;

	const pageParam = url.searchParams.get('page');
	const parsedPage = pageParam ? Number(pageParam) : NaN;
	const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

	// Load menu entry for current page path to get locale-aware title
	let titleKo = 'Template 01';
	let titleEn = 'Template 01';
	try {
		const allMenus = await getAllMenus();
		const currentMenu = allMenus.find((m) => m.path === '/Template/T01');
		if (currentMenu) {
			titleKo = currentMenu.ko_name;
			titleEn = currentMenu.en_name;
		}
	} catch {
		// fallback to hardcoded title
	}

	try {
		const result = await getTemplates({ search, page, pageSize: 20 });

		return {
			items: result.data,
			total: result.total,
			totalPages: result.totalPages,
			page: result.page,
			search: searchParam ?? null,
			error: null,
			titleKo,
			titleEn
		};
	} catch {
		return {
			items: [],
			total: 0,
			totalPages: 0,
			page: 1,
			search: searchParam ?? null,
			error: '데이터를 불러오는 중 오류가 발생했습니다.',
			titleKo,
			titleEn
		};
	}
};
