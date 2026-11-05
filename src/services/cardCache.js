const {
  getCache,
  setCache,
  delCache,
  delCacheByPattern,
} = require("../utils/redisCache");

const CARD_CACHE_PREFIX = "cards:list:";


const getCardCache = async (key) => {
  return await getCache(key);
};


const setCardCache = async (key, data, expiry = 300) => {
  return await setCache(key, data, expiry);
};


const delCardCache = async () => {
  return await delCacheByPattern(`${CARD_CACHE_PREFIX}*`);
};

module.exports = {
  getCardCache,
  setCardCache,
  delCardCache,
};