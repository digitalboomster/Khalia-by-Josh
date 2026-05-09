/**
 * Groups Service - Group management and contributions
 */

import apiClient from './api-client';

export interface GroupMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  role: 'creator' | 'admin' | 'member';
  trust_score: number;
  kyc_level: number;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  contribution_amount: number;
  contribution_frequency: string;
  max_members: number;
  member_count: number;
  status: string;
  created_at: string;
  creator_id: string;
  shariah_compliant: boolean;
  payout_strategy: string;
}

export interface GroupDetails extends Group {
  members: GroupMember[];
}

export interface Contribution {
  id: string;
  user_id: string;
  group_id: string;
  cycle_id: string;
  amount: number;
  status: string;
  due_date: string;
  paid_at?: string;
}

export interface CreateGroupPayload {
  name: string;
  description?: string;
  contribution_amount: number;
  contribution_frequency: string;
  max_members: number;
  shariah_compliant?: boolean;
  payout_strategy?: string;
}

class GroupsService {
  async createGroup(payload: CreateGroupPayload): Promise<Group> {
    return apiClient.request<Group>('post', '/groups', payload);
  }

  async getGroupDetails(groupId: string): Promise<GroupDetails> {
    return apiClient.request<GroupDetails>('get', `/groups/${groupId}`);
  }

  async listUserGroups(): Promise<Group[]> {
    return apiClient.request<Group[]>('get', '/groups');
  }

  async joinGroup(groupId: string): Promise<void> {
    await apiClient.request('post', `/groups/${groupId}/join`, {});
  }

  async leaveGroup(groupId: string): Promise<void> {
    await apiClient.request('post', `/groups/${groupId}/leave`, {});
  }

  async startContributionCycle(groupId: string): Promise<void> {
    await apiClient.request('post', `/groups/${groupId}/start-cycle`, {});
  }

  async recordContribution(groupId: string, cycleId: string): Promise<Contribution> {
    return apiClient.request<Contribution>('post', `/groups/${groupId}/contribute`, { cycle_id: cycleId });
  }

  async getNextPayoutInfo(
    groupId: string,
  ): Promise<{
    recipient_id: string;
    recipient_name: string;
    total_collected: number;
    suggested: boolean;
  }> {
    return apiClient.request('get', `/groups/${groupId}/payout-info`);
  }
}

const groupsService = new GroupsService();
export { groupsService };
export default groupsService;
