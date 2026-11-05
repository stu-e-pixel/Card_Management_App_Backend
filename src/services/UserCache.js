const { getCache, setCache, delCacheByPattern } = require("../utils/redisCache")

const USER_CACHE_PREFIX="User:list:"

const getUserCache = async(key)=>{
    return await getCache(key)
}
const setUserCache = async(key,data,expiry=300)=>{
    return await setCache(key,data,expiry)
}
const deleteUserCache = async(key)=>{
    return await delCacheByPattern(`${USER_CACHE_PREFIX}*`)
}


module.exports={getUserCache,setUserCache,deleteUserCache}