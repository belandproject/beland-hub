import { getFilterOptions } from '../../elastic';
async function filterOptions(ctx) {
  const fileOptions: any = await getFilterOptions(ctx.query);
  ctx.body = fileOptions;
}
export { filterOptions };
