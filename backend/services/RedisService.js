'use strict';

/**
 * @module RedisService
 * @type {exports}
 */

var logger = require('log4js').getLogger('RedisService');
logger.info('initalizing RedisService');
const redisClient = require('redis').createClient;
const redis = redisClient(6379, 'localhost');
redis.on('connect', () => {
    logger.info('connected to Redis');
});

module.exports = {
    /**
     * Get the application's connected Redis client instance.
     *
     * @returns {Object} - a connected node_redis client instance.
     */
    getClient: () => redis,
  };
  