import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { User } from '../models/user.model';
import { Organization } from '../models/organization.model';
import { NavNode } from '../models/nav-node.model';
import { FeatureFlagConfig } from '../models/feature-flag.model';

interface CachedData {
  key: string;
  value: any;
  timestamp: number;
  expiresAt?: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService extends Dexie {
  users!: Table<User, string>;
  organizations!: Table<Organization, string>;
  navigationConfig!: Table<{ id: string; tree: NavNode[] }, string>;
  featureFlags!: Table<FeatureFlagConfig & { id: string }, string>;
  cache!: Table<CachedData, string>;

  constructor() {
    super('EBMDatabase');

    this.version(1).stores({
      users: 'id, email',
      organizations: 'id, name',
      navigationConfig: 'id',
      featureFlags: 'id',
      cache: 'key, timestamp'
    });
  }

  async cacheData(key: string, value: any, ttlMinutes?: number): Promise<void> {
    const timestamp = Date.now();
    const expiresAt = ttlMinutes ? timestamp + (ttlMinutes * 60 * 1000) : undefined;

    await this.cache.put({ key, value, timestamp, expiresAt });
  }

  async getCachedData<T>(key: string): Promise<T | null> {
    const cached = await this.cache.get(key);

    if (!cached) return null;

    // Check expiration
    if (cached.expiresAt && Date.now() > cached.expiresAt) {
      await this.cache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  async clearExpiredCache(): Promise<void> {
    const now = Date.now();
    await this.cache
      .filter(item => item.expiresAt !== undefined && item.expiresAt < now)
      .delete();
  }

  async clearAllCache(): Promise<void> {
    await this.cache.clear();
  }
}
