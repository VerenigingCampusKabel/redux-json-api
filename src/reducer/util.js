export const getPageFromUrl = (url) => parseInt((new URL(url)).searchParams.get('page[number]'));
