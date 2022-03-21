'use strict';

import Router from 'koa-joi-router';
import events from './events';
import bids from './bids';
import * as filterOptions from './filter-options';
import { listEstate } from './estates';
import { listParcel } from './parcels';
import { listScenes } from './scenes';
import userRouter from './users';
import collectionRouter from './collections';
import collectionItemRouter from './collection-items';
import uploadRouter from './upload';
import nftRouter from './nfts';
import entitiesRouter from './entities';

const router = new Router();
const apiV1 = new Router();

router.get('/events', events.list);
router.get('/bids', bids.list);
router.get('/filter-options', filterOptions.filterOptions);
router.get('/estates', listEstate);
router.get('/parcels', listParcel);
router.get('/scenes', listScenes);
router.use('/users', userRouter.middleware());
router.use('/collections', collectionRouter.middleware());
router.use('/collection-items', collectionItemRouter.middleware());
router.use('/upload', uploadRouter.middleware());
router.use("/nfts", nftRouter.middleware());
router.use("/entities", entitiesRouter.middleware());

apiV1.use('/v1', router.middleware());
export default apiV1;
