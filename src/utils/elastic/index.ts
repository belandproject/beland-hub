import { Client } from '@elastic/elasticsearch';
import { getEsIndex } from '../es';
let client;
if (process.env.ES_URL) {
  client = new Client({
    node: process.env.ES_URL,
  });
}

export const getNftFilterOptions = (params: any) => {
  return getFilterOptions(params, {table: "nfts"})
}

export const getItemFilterOptions = (params: any) => {
  return getFilterOptions(params, {table: "items"})
}

export const getFilterOptions = async (params, options: { table: string }) => {
  let must = [];
  for (let key in params) {
    must.push({
      term: {
        [key]: params[key],
      },
    });
  }

  const { body } = await client.search({
    index: getEsIndex(options.table),
    body: {
      size: 0,
      query: {
        bool: {
          must: must,
        },
      },
      aggs: {
        stats: {
          nested: {
            path: 'traits',
          },
          aggs: {
            names: {
              terms: {
                field: 'traits.name',
                size: 100,
              },
              aggs: {
                values: {
                  terms: {
                    size: 200,
                    field: 'traits.value',
                  },
                },
                max_value: { max: { field: 'traits.intValue' } },
                min_value: { min: { field: 'traits.intValue' } },
              },
            },
          },
        },
      },
    },
  });
  return {
    stringProperties: body.aggregations.stats.names.buckets
      .filter(a => a.values.buckets.length > 0)
      .map(b => {
        return {
          key: b.key,
          values: b.values.buckets.map(bb => {
            return {
              value: bb.key,
              count: bb.doc_count,
            };
          }),
        };
      }),
    numberProperties: body.aggregations.stats.names.buckets
      .filter(a => a.max_value.value > 0)
      .map(b => {
        return {
          key: b.key,
          value: {
            min: b.min_value.value,
            max: b.max_value.value,
          },
        };
      }),
  };
};

function buildQueryTrailt(params, field: string, type: string) {
  let _paramKey = field.replace(type + '_', '').split('__');
  const traitField = type == 'int' ? 'traits.intValue' : 'traits.value';
  let _must: any = {
    terms: {
      [traitField]: params[field].split(','),
    },
  };
  if (_paramKey.length > 1) {
    switch (_paramKey[1]) {
      case 'lt':
      case 'gt':
      case 'lte':
      case 'gte':
        _must = {
          range: {
            [traitField]: { [_paramKey[1]]: params[field] },
          },
        };
        break;
      case 'in':
      default:
    }
  }

  return {
    nested: {
      path: 'traits',
      query: {
        bool: {
          must: [
            {
              term: {
                'traits.name': _paramKey[0],
              },
            },
            _must,
          ],
        },
      },
    },
  };
}

export function searchNFT(params: any) {
  return search(params, {
    table: 'nfts',
    onlySale: false,
    searchFields: ['id', 'name', 'description', 'traits.value'],
  });
}

export function searchItem(params: any) {
  return search(params, {
    table: 'items',
    onlySale: true,
    searchFields: ['id', 'name', 'description', 'traits.value'],
  });
}

export const search = async (
  params,
  options: { table: string; searchFields: string[]; onlySale: boolean }
) => {
  let must = [];
  let should = [];

  const {
    from,
    size,
    orderBy = 'id',
    orderDirection = 'desc',
    ids,
    q,
    toggles,
    otherParams,
  } = params;

  const sort = [
    {
      [orderBy]: orderDirection,
    },
  ];

  const datetime = new Date().toISOString();

  if (ids) {
    must.push({
      terms: {
        id: ids.split(','),
      },
    });
  }

  if (q) {
    must.push({
      multi_match: {
        query: q,
        fields: options.searchFields,
      },
    });
  }
  if (toggles) {
    if (options.onlySale) {
      if (toggles.includes('ON_SALE')) {
        should.push({ term: { onSale: true } });
      }
    } else {
      if (toggles.includes('ON_SALE')) {
        should.push({ term: { onSale: true } });
      }
      if (toggles.includes('HAS_OFFER')) {
        should.push({ term: { hasOffer: true } });
      }
      if (toggles.includes('ON_AUCTION')) {
        should.push({
          bool: {
            must: [
              { term: { onAuction: true } },
              { range: { auctionStartTime: { lte: datetime } } },
              { range: { auctionEndTime: { gte: datetime } } },
            ],
          },
        });
      }
      if (toggles.includes('ON_LEND')) {
        should.push({
          bool: {
            must: [{ term: { onLending: true } }, { range: { expiredAt: { lte: datetime } } }],
          },
        });
      }
    }
    must.push({
      bool: {
        should,
      },
    });
  }
  for (let paramKey in otherParams) {
    if (paramKey.startsWith('int_')) {
      must.push(buildQueryTrailt(otherParams, paramKey, 'init'));
    } else if (paramKey.startsWith('string_')) {
      must.push(buildQueryTrailt(otherParams, paramKey, 'string'));
    } else {
      let _paramKey = paramKey.split('__');
      let _must: any = {
        term: {
          [_paramKey[0]]: otherParams[paramKey],
        },
      };
      if (_paramKey.length > 1) {
        switch (_paramKey[1]) {
          case 'lt':
          case 'gt':
          case 'lte':
          case 'gte':
            _must = {
              range: {
                [_paramKey[0]]: { [_paramKey[1]]: otherParams[paramKey] },
              },
            };
            break;
          case 'in':
            _must = {
              terms: {
                [_paramKey[0]]: otherParams[paramKey].split(','),
              },
            };
            break;
          default:
        }
      }
      must.push(_must);
    }
  }
  const { body } = await client.search({
    index: getEsIndex(options.table),
    body: {
      track_total_hits: true,
      sort,
      from,
      size,
      query: {
        bool: {
          must,
        },
      },
    },
  });
  return body;
};
