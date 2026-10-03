import { ROLES } from '../../constants/roles';
import { ApiError } from '../../utils/ApiError';
import { TokenPayload } from '../../utils/token';
import { Center } from '../center/center.model';
import { Branch } from './branch.model';

async function nextBranchCode(somitiId: string) {
  const count = await Branch.countDocuments({ somiti: somitiId });
  for (let n = count + 1; n < count + 1000; n += 1) {
    const code = `BR${String(n).padStart(3, '0')}`;
    const taken = await Branch.findOne({ somiti: somitiId, code });
    if (!taken) return code;
  }
  return `BR${Date.now().toString().slice(-6)}`;
}

export const branchService = {
  async list(actor: TokenPayload): Promise<Record<string, unknown>[]> {
    const filter =
      actor.role === ROLES.SUPER_ADMIN
        ? {}
        : actor.role === ROLES.BRANCH_MANAGER && actor.branchId
          ? { _id: actor.branchId }
          : { somiti: actor.somitiId };

    const branches = await Branch.find(filter)
      .populate('manager', 'name phone role')
      .populate('somiti', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    const ids = branches.map((branch) => branch._id);
    const counts = await Center.aggregate<{ _id: unknown; count: number }>([
      { $match: { branch: { $in: ids } } },
      { $group: { _id: '$branch', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

    return branches.map((branch) => ({
      ...branch,
      centerCount: countMap.get(String(branch._id)) ?? 0,
    }));
  },

  async create(
    actor: TokenPayload,
    input: {
      name: string;
      code?: string;
      address?: string;
      phone?: string;
      managerId?: string;
      somitiId?: string;
    }
  ) {
    const somitiId = actor.role === ROLES.SUPER_ADMIN ? input.somitiId : actor.somitiId;
    if (!somitiId) throw new ApiError(400, 'Somiti is required');

    const code = (input.code || (await nextBranchCode(somitiId))).toUpperCase();
    const exists = await Branch.findOne({ somiti: somitiId, code });
    if (exists) throw new ApiError(409, 'Branch code already exists in this somiti');

    const branch = await Branch.create({
      name: input.name,
      code,
      somiti: somitiId,
      address: input.address,
      phone: input.phone,
      manager: input.managerId,
    });

    return branch.populate(['manager', 'somiti']);
  },

  async update(actor: TokenPayload, id: string, input: Record<string, unknown>) {
    const branch = await Branch.findById(id);
    if (!branch) throw new ApiError(404, 'Branch not found');

    if (
      actor.role !== ROLES.SUPER_ADMIN &&
      branch.somiti.toString() !== actor.somitiId
    ) {
      throw new ApiError(403, 'You can only manage branches in your somiti');
    }

    if (input.name) branch.name = input.name as string;
    if (input.address !== undefined) branch.address = input.address as string;
    if (input.phone !== undefined) branch.phone = input.phone as string;
    if (input.managerId !== undefined) {
      branch.manager = input.managerId ? (input.managerId as never) : undefined;
    }
    if (typeof input.isActive === 'boolean') branch.isActive = input.isActive;

    await branch.save();
    return branch.populate(['manager', 'somiti']);
  },
};
