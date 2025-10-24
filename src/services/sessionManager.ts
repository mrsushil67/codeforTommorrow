import { redisClient } from "./cache";

const PREFIX = "active_jti:";

export const SessionManager = {
    
    async setActiveJTI(userId: number, jti: string, expireInSeconds: number): Promise<void> {
        const key = `${PREFIX}${userId}`;
        await redisClient.set(key, jti, 'EX', expireInSeconds);
    },

    async verifyActiveJTI(userId: string, jti: string): Promise<boolean> {
        const key = `${PREFIX}${userId}`;
        const activeJti = await redisClient.get(key);
        return activeJti === jti;
    },

    async clearActiveJTI(userId: number): Promise<void> {
        const key = `${PREFIX}${userId}`;
        await redisClient.del(key);
    }
}