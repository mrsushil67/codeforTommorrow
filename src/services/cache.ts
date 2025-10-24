import Redis from "ioredis";
export let redisClient: Redis;

export async function initRedis(): Promise<void> {
    const url = process.env.REDIS_URL || "redis://localhost:6379";
    redisClient = new Redis(url);

    await redisClient.ping();
    console.log("Redis connected");
}

export async function cacheGet<T>(key: string): Promise<T | null> {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) as T : null;
}

export async function cacheSer(key: string, value: any, expireInSeconds?: number): Promise<void> {
    await redisClient.set(key, JSON.stringify(value)), "EX", expireInSeconds || 3600;
}

export async function cacheDel(key: string): Promise<void> {
    await redisClient.del(key);
}   
