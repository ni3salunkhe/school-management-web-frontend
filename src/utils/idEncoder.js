// utils/hashId.js
import Hashids from 'hashids';

// Make sure to keep this salt secret in real apps!
const hashids = new Hashids('your-secret-salt', 8); // 8-character hashes

export const encodeId = (id) => hashids.encode(id);
export const decodeId = (hash) => {
  const [decoded] = hashids.decode(hash);
  return decoded || null; // return null if decode fails
};
