import { Client } from '@elastic/elasticsearch';
import { getEsIndex } from '../es';
let client;
if (process.env.ES_URL) {
  client = new Client({
    node: process.env.ES_URL,
  });
}

export const getFilterOptions = async params => {
  let must = [];
  for (let key in params) {
    must.push({
      term: {
        [key]: params[key],
      },
    });
  }

  const { body } = await client.search({
    index: getEsIndex('nfts'),
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

export const search = async params => {
  let must = [];
  let should = [];
  const sort = [
    {
      [params.orderBy || 'id']: params.orderDirection || 'desc',
    },
  ];
  const from = params.offset;
  const size = params.limit;
  delete params.orderBy;
  delete params.orderDirection;
  delete params.limit;
  delete params.offset;
  const datetime = new Date().toISOString();
  for (let paramKey in params) {
    if (paramKey.startsWith('int_')) {
      let _paramKey = paramKey.replace('int_', '').split('__');
      let _must: any = {
        terms: {
          'traits.intValue': params[paramKey].split(','),
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
                'traits.intValue': { [_paramKey[1]]: params[paramKey] },
              },
            };
            break;
          case 'in':
          default:
        }
      }

      must.push({
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
      });
    } else if (paramKey.startsWith('string_')) {
      let _paramKey = paramKey.replace('string_', '').split('__');
      let _must: any = {
        terms: {
          'traits.value': params[paramKey].split(','),
        },
      };
      must.push({
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
      });
    } else if (paramKey == 'ids') {
      must.push({
        terms: {
          id: params[paramKey].split(','),
        },
      });
    } else if (paramKey == 'q') {
      must.push({
        multi_match: {
          query: params[paramKey],
          fields: ['id', 'name', 'description', 'traits.value'],
        },
      });
    } else if (paramKey == 'toggles') {
      if (params[paramKey].includes('ON_SALE')) {
        should.push({ term: { onSale: true } });
      }
      if (params[paramKey].includes('HAS_OFFER')) {
        should.push({ term: { hasOffer: true } });
      }
      if (params[paramKey].includes('ON_AUCTION')) {
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
      if (params[paramKey].includes('ON_LEND')) {
        should.push({
          bool: {
            must: [
              { term: { onLending: true } },
              {
                bool: {
                  should: [
                    {
                      bool: {
                        must: [{ range: { expiredAt: { lte: datetime } } }],
                      },
                    },
                    {
                      bool: {
                        must: [{ term: { renter: null } }],
                      },
                    },
                  ],
                },
              },
            ],
          },
        });
      }
      must.push({
        bool: {
          should,
        },
      });
    } else {
      let _paramKey = paramKey.split('__');
      let _must: any = {
        term: {
          [_paramKey[0]]: params[paramKey],
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
                [_paramKey[0]]: { [_paramKey[1]]: params[paramKey] },
              },
            };
            break;
          case 'in':
            _must = {
              terms: {
                [_paramKey[0]]: params[paramKey].split(','),
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
    index: getEsIndex('nfts'),
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
