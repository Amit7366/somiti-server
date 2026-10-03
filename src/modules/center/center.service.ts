import { ROLES } from '../../constants/roles';
import { ApiError } from '../../utils/ApiError';
import { TokenPayload } from '../../utils/token';
import { Area } from '../area/area.model';
import { Branch } from '../branch/branch.model';
import { Center } from './center.model';

const POPULATE = [
  { path: 'branch', select: 'name code phone address' },
  { path: 'area', select: 'name' },
  { path: 'fieldWorker', select: 'name phone role' },
  { path: 'somiti', select: 'name code' },
];

function somitiIdOf(actor: TokenPayload) {
  if (actor.role === ROLES.SUPER_ADMIN) return undefined;
  if (!actor.somitiId) throw new ApiError(400, 'Somiti is required');
  return actor.somitiId;
}

async function assertBranch(actor: TokenPayload, branchId: string) {
  const branch = await Branch.findById(branchId);
  if (!branch) throw new ApiError(404, 'Branch not found');
  if (actor.role !== ROLES.SUPER_ADMIN && branch.somiti.toString() !== actor.somitiId) {
    throw new ApiError(403, 'Branch is outside your somiti');
  }
  if (actor.role === ROLES.BRANCH_MANAGER && actor.branchId && branch._id.toString() !== actor.branchId) {
    throw new ApiError(403, 'You can only manage centers in your branch');
  }
  return branch;
}

export const centerService = {
  async list(
    actor: TokenPayload,
    query: { branchId?: string; areaId?: string }
  ) {
    const filter: Record<string, unknown> = {};
    const somitiId = somitiIdOf(actor);
    if (somitiId) filter.somiti = somitiId;
    if (query.branchId) filter.branch = query.branchId;
    if (query.areaId) filter.area = query.areaId;
    if (actor.role === ROLES.BRANCH_MANAGER && actor.branchId && !query.branchId) {
      filter.branch = actor.branchId;
    }

    return Center.find(filter).populate(POPULATE).sort({ createdAt: -1 });
  },

  async getById(actor: TokenPayload, id: string) {
    const center = await Center.findById(id).populate(POPULATE);
    if (!center) throw new ApiError(404, 'Center not found');
    if (actor.role !== ROLES.SUPER_ADMIN && center.somiti.toString() !== actor.somitiId) {
      throw new ApiError(403, 'Center is outside your somiti');
    }
    return center;
  },

  async create(
    actor: TokenPayload,
    input: {
      name: string;
      branchId: string;
      areaId?: string;
      leaderName?: string;
      leaderMobile?: string;
      meetingDay?: string;
      meetingTime?: string;
      fieldWorkerId?: string;
      address?: string;
    }
  ) {
    const branch = await assertBranch(actor, input.branchId);
    const exists = await Center.findOne({ branch: branch._id, name: input.name.trim() });
    if (exists) throw new ApiError(409, 'A center with this name already exists in this branch');

    if (input.areaId) {
      const area = await Area.findById(input.areaId);
      if (!area) throw new ApiError(404, 'Area not found');
      if (area.somiti.toString() !== branch.somiti.toString()) {
        throw new ApiError(400, 'Area does not belong to this somiti');
      }
    }

    const center = await Center.create({
      name: input.name.trim(),
      somiti: branch.somiti,
      branch: branch._id,
      area: input.areaId,
      leaderName: input.leaderName,
      leaderMobile: input.leaderMobile,
      meetingDay: input.meetingDay,
      meetingTime: input.meetingTime,
      fieldWorker: input.fieldWorkerId,
      address: input.address,
    });

    return center.populate(POPULATE);
  },

  async update(
    actor: TokenPayload,
    id: string,
    input: {
      name?: string;
      branchId?: string;
      areaId?: string | null;
      leaderName?: string;
      leaderMobile?: string;
      meetingDay?: string | null;
      meetingTime?: string;
      fieldWorkerId?: string | null;
      address?: string;
      isActive?: boolean;
    }
  ) {
    const center = await Center.findById(id);
    if (!center) throw new ApiError(404, 'Center not found');
    if (actor.role !== ROLES.SUPER_ADMIN && center.somiti.toString() !== actor.somitiId) {
      throw new ApiError(403, 'Center is outside your somiti');
    }
    if (
      actor.role === ROLES.BRANCH_MANAGER &&
      actor.branchId &&
      center.branch.toString() !== actor.branchId
    ) {
      throw new ApiError(403, 'You can only manage centers in your branch');
    }

    if (input.branchId) {
      const branch = await assertBranch(actor, input.branchId);
      center.branch = branch._id;
      center.somiti = branch.somiti;
    }
    if (input.name) center.name = input.name.trim();
    if (input.areaId !== undefined) {
      center.area = input.areaId ? (input.areaId as never) : undefined;
    }
    if (input.leaderName !== undefined) center.leaderName = input.leaderName;
    if (input.leaderMobile !== undefined) center.leaderMobile = input.leaderMobile;
    if (input.meetingDay !== undefined) {
      center.meetingDay = input.meetingDay ? (input.meetingDay as never) : undefined;
    }
    if (input.meetingTime !== undefined) center.meetingTime = input.meetingTime;
    if (input.fieldWorkerId !== undefined) {
      center.fieldWorker = input.fieldWorkerId ? (input.fieldWorkerId as never) : undefined;
    }
    if (input.address !== undefined) center.address = input.address;
    if (typeof input.isActive === 'boolean') center.isActive = input.isActive;

    await center.save();
    return center.populate(POPULATE);
  },
};
