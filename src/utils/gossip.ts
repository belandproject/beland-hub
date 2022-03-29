import axios from 'axios';
import { QueryTypes } from 'sequelize';
import db from '../database';

let hubs = [];

export async function gossip(ctx) {
  hubs.forEach((hub: any) => {
    axios({
      method: ctx.request.method,
      url: `https://${hub.host}${ctx.request.path}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: ctx.request.headers.authorization,
      },
      data: ctx.body,
    }).catch(e => console.log('Relay failed', e));
  });
}

setTimeout(async () => {
  try {
    hubs = await db.query(`SELECT * FROM hubs WHERE is_active = '1' AND is_self = '0'`, {
      type: QueryTypes.SELECT,
    });
  } catch (e) {
    console.log('Load hubs failed', e);
  }
}, 1e3);
