import { ROLES } from '../../constants/roles';
import { ApiError } from '../../utils/ApiError';
import { TokenPayload } from '../../utils/token';
import { Branch } from '../branch/branch.model';
import { Center } from '../center/center.model';
import { Area } from './area.model';

function somitiFilter(actor: TokenPayload) {
  if (actor.role === ROLES.SUPER_ADMIN) return {};
  if (!actor.somitiId) throw new ApiError(400, 'Somiti is required');
  return { somiti: actor.somitiId };
}

function populate(): (string)[] {
  return ["branch", "somiti"];
}

export const areaService = {
  async list(actor: TokenPayload, query: { branchId?: string }): Promise<Record<string, unknown>[]> {
    const filter: Record<string, unknown> = somitiFilter(actor);
    if (query.branchId) filter.branch = query.branchId;
    if (actor.role === ROLES.BRANCH_MANAGER && actor.branchId) {
      filter.$or = [{ branch: actor.branchId }, { branch: { $exists: false } }, { branch: null }];
    }

    const areas = await Area.find(filter)
      .populate(populate())
      .sort({ name: 1 })
      .lean();

    const ids = areas.map((area) => area._id);
    const counts = await Center.aggregate<{ _id: unknown; count: number }>([
      { $match: { area: { $in: ids } } },
      { $group: { _id: '$area', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

    return areas.map((area) => ({
      ...area,
      centerCount: countMap.get(String(area._id)) ?? 0,
    }));
  },

  async create(actor: TokenPayload, input: { name: string; branchId?: string }) {
    const somitiId = actor.somitiId;
    if (actor.role !== ROLES.SUPER_ADMIN && !somitiId) {
      throw new ApiError(400, 'Somiti is required');
    }

    let branchId = input.branchId;
    if (actor.role === ROLES.BRANCH_MANAGER) {
      branchId = actor.branchId;
    }

    let somiti: string | undefined = somitiId;
    if (branchId) {
      const branch = await Branch.findById(branchId);
      if (!branch) throw new ApiError(404, 'Branch not found');
      if (somitiId && branch.somiti.toString() !== somitiId) {
        throw new ApiError(403, 'Branch is outside your somiti');
      }
      somiti = branch.somiti.toString();
    }
    if (!somiti) throw new ApiError(400, 'Somiti is required');

    const exists = await Area.findOne({ somiti, name: input.name.trim() });
    if (exists) throw new ApiError(409, 'An area with this name already exists');

    const area = await Area.create({
      name: input.name.trim(),
      somiti,
      branch: branchId,
    });
    return area.populate(populate());
  },

  async update(
    actor: TokenPayload,
    id: string,
    input: { name?: string; branchId?: string | null; isActive?: boolean }
  ) {
    const area = await Area.findById(id);
    if (!area) throw new ApiError(404, 'Area not found');
    if (actor.role !== ROLES.SUPER_ADMIN && area.somiti.toString() !== actor.somitiId) {
      throw new ApiError(403, 'You can only manage areas in your somiti');
    }

    if (input.name) area.name = input.name;
    if (input.branchId !== undefined) {
      area.branch = input.branchId ? (input.branchId as never) : undefined;
    }
    if (typeof input.isActive === 'boolean') area.isActive = input.isActive;
    await area.save();
    return area.populate(populate());
  },
};
