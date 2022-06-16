import { getNftFilterOptions } from '../../utils/elastic';
async function filterOptions(ctx) {
  const fileOptions: any = await getNftFilterOptions(ctx.query);
  ctx.body = fileOptions;
}
export { filterOptions };
