import * as ipfsClient from '../../ipfsClient';
import ADMZip from 'adm-zip';

export const uploadFile = async ctx => {
  var contents = [];
  if (ctx.file.mimetype === 'application/zip') {
    var zip = new ADMZip(ctx.file.buffer);
    var zipEntries = zip.getEntries().filter(zipEntry => !zipEntry.isDirectory);
    contents = await Promise.all(
      zipEntries.map(zipEntry => {
        return ipfsClient
          .add({
            path: zipEntry.entryName,
            content: zipEntry.getData(),
          })
          .then(hash => {
            return {
              path: zipEntry.entryName,
              hash: 'ipfs://' + hash,
            };
          });
      })
    );
  } else {
    const hash = await ipfsClient.add({
      path: ctx.file.originalname,
      content: ctx.file.buffer,
    });
    contents.push({
      hash: 'ipfs://' + hash,
      path: ctx.file.originalname,
    });
  }
  ctx.body = contents;
};

export async function createMetadata(ctx) {
  const hash = await ipfsClient.add({
    path: 'metadata.json',
    content: Buffer.from(JSON.stringify(ctx.request.body), 'utf8'),
  });

  ctx.body = {
    ipfs_uri: 'ipfs://' + hash,
  };
}
