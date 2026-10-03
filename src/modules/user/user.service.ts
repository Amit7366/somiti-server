import { FilterQuery } from 'mongoose';
import { PERMISSIONS, hasPermission } from '../../constants/permissions';
import { ROLES, type Role } from '../../constants/roles';
import { ApiError } from '../../utils/ApiError';
import { TokenPayload } from '../../utils/token';
import { IUser, User } from './user.model';

function assertSomitiAccess(actor: TokenPayload, somitiId?: string) {
  if (actor.role === ROLES.SUPER_ADMIN) return;
  if (!actor.somitiId || (somitiId && actor.somitiId !== somitiId)) {
    throw new ApiError(403, 'You can only manage users in your own somiti');
  }
}

function publicUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    somiti: user.somiti,
    branch: user.branch,
    nid: user.nid,
    address: user.address,
    isActive: user.isActive,
    isApproved: user.isApproved,
    createdAt: user.createdAt,
  };
}

export const userService = {
  async list(actor: TokenPayload, query: { role?: string; status?: string; search?: string }) {
    const filter: FilterQuery<IUser> = {};

    if (actor.role !== ROLES.SUPER_ADMIN) {
      filter.somiti = actor.somitiId;
    }

    if (query.role) filter.role = query.role;
    if (query.status === 'pending') filter.isApproved = false;
    if (query.status === 'approved') filter.isApproved = true;
    if (query.status === 'inactive') filter.isActive = false;

    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
        { email: { $regex: query.search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .populate('somiti', 'name code')
      .populate('branch', 'name code')
      .sort({ createdAt: -1 });

    return users.map(publicUser);
  },

  async getById(actor: TokenPayload, id: string) {
    if (actor.role === ROLES.MEMBER && actor.id !== id) {
      throw new ApiError(403, 'Members can only view their own profile');
    }

    const user = await User.findById(id)
      .populate('somiti', 'name code')
      .populate('branch', 'name code');

    if (!user) throw new ApiError(404, 'User not found');
    assertSomitiAccess(actor, user.somiti?.toString());
    return publicUser(user);
  },

  async create(actor: TokenPayload, input: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    role: Role;
    somitiId?: string;
    branchId?: string;
    nid?: string;
    address?: string;
  }) {
    if (input.role === ROLES.SUPER_ADMIN && actor.role !== ROLES.SUPER_ADMIN) {
      throw new ApiError(403, 'Only a super admin can create another super admin');
    }

    const somitiId =
      actor.role === ROLES.SUPER_ADMIN ? input.somitiId : actor.somitiId;

    if (input.role !== ROLES.SUPER_ADMIN && !somitiId) {
      throw new ApiError(400, 'Somiti is required for this role');
    }

    assertSomitiAccess(actor, somitiId);

    if (
      actor.role !== ROLES.SUPER_ADMIN &&
      !hasPermission(actor.role, PERMISSIONS.USER_WRITE)
    ) {
      throw new ApiError(403, 'You cannot create users');
    }

    const exists = await User.findOne({
      $or: [{ phone: input.phone }, ...(input.email ? [{ email: input.email }] : [])],
    });
    if (exists) {
      throw new ApiError(409, 'An account with this phone or email already exists');
    }

    const user = await User.create({
      name: input.name,
      phone: input.phone,
      email: input.email || undefined,
      password: input.password,
      role: input.role,
      somiti: somitiId,
      branch: input.branchId,
      nid: input.nid,
      address: input.address,
      isApproved: true,
      isActive: true,
    });

    const populated = await User.findById(user._id)
      .populate('somiti', 'name code')
      .populate('branch', 'name code');

    return publicUser(populated!);
  },

  async update(actor: TokenPayload, id: string, input: Record<string, unknown>) {
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'User not found');

    if (actor.role === ROLES.MEMBER && actor.id !== id) {
      throw new ApiError(403, 'Members can only update their own profile');
    }

    assertSomitiAccess(actor, user.somiti?.toString());

    if (input.name) user.name = input.name as string;
    if (input.email) user.email = input.email as string;
    if (input.phone) user.phone = input.phone as string;
    if (input.nid !== undefined) user.nid = input.nid as string;
    if (input.address !== undefined) user.address = input.address as string;
    if (input.branchId !== undefined) {
      user.branch = input.branchId ? (input.branchId as never) : undefined;
    }

    await user.save();
    await user.populate('somiti', 'name code');
    await user.populate('branch', 'name code');
    return publicUser(user);
  },

  async approve(actor: TokenPayload, id: string) {
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'User not found');
    assertSomitiAccess(actor, user.somiti?.toString());
    user.isApproved = true;
    await user.save();
    return publicUser(user);
  },

  async setActive(actor: TokenPayload, id: string, isActive: boolean) {
    if (actor.id === id) {
      throw new ApiError(400, 'You cannot change your own active status');
    }
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'User not found');
    assertSomitiAccess(actor, user.somiti?.toString());
    user.isActive = isActive;
    await user.save();
    return publicUser(user);
  },

  async changeRole(actor: TokenPayload, id: string, role: Role) {
    if (role === ROLES.SUPER_ADMIN) {
      throw new ApiError(403, 'Cannot assign super admin through this endpoint');
    }
    const user = await User.findById(id);
    if (!user) throw new ApiError(404, 'User not found');
    assertSomitiAccess(actor, user.somiti?.toString());
    user.role = role;
    await user.save();
    return publicUser(user);
  },
};
