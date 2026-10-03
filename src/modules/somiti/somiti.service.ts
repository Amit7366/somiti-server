import { ROLES } from '../../constants/roles';
import { ApiError } from '../../utils/ApiError';
import { TokenPayload } from '../../utils/token';
import { User } from '../user/user.model';
import { Somiti } from './somiti.model';

export const somitiService = {
  async list(actor: TokenPayload) {
    if (actor.role === ROLES.SUPER_ADMIN) {
      return Somiti.find().sort({ createdAt: -1 });
    }
    if (!actor.somitiId) return [];
    return Somiti.find({ _id: actor.somitiId });
  },

  async getById(actor: TokenPayload, id: string) {
    if (actor.role !== ROLES.SUPER_ADMIN && actor.somitiId !== id) {
      throw new ApiError(403, 'You can only view your own somiti');
    }
    const somiti = await Somiti.findById(id);
    if (!somiti) throw new ApiError(404, 'Somiti not found');
    return somiti;
  },

  async create(
    actor: TokenPayload,
    input: {
      name: string;
      code: string;
      address?: string;
      phone?: string;
      email?: string;
      registrationNo?: string;
      collectionFrequency?: 'daily' | 'weekly' | 'monthly';
      admin?: { name: string; phone: string; email: string; password: string };
    }
  ) {
    const code = input.code.toUpperCase();
    const exists = await Somiti.findOne({ code });
    if (exists) throw new ApiError(409, 'Somiti code already in use');

    const somiti = await Somiti.create({
      name: input.name,
      code,
      address: input.address,
      phone: input.phone,
      email: input.email,
      registrationNo: input.registrationNo,
      createdBy: actor.id,
      settings: {
        currency: 'BDT',
        collectionFrequency: input.collectionFrequency || 'weekly',
      },
      subscription: {
        plan: 'standard',
        status: 'trial',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    let admin = null;
    if (input.admin) {
      const conflict = await User.findOne({
        $or: [{ phone: input.admin.phone }, { email: input.admin.email }],
      });
      if (conflict) {
        throw new ApiError(409, 'Admin phone or email already exists');
      }

      admin = await User.create({
        name: input.admin.name,
        phone: input.admin.phone,
        email: input.admin.email,
        password: input.admin.password,
        role: ROLES.SOMITI_ADMIN,
        somiti: somiti._id,
        isApproved: true,
        isActive: true,
      });
    }

    return { somiti, admin };
  },

  async update(actor: TokenPayload, id: string, input: Record<string, unknown>) {
    if (actor.role !== ROLES.SUPER_ADMIN && actor.somitiId !== id) {
      throw new ApiError(403, 'You can only update your own somiti');
    }

    const somiti = await Somiti.findById(id);
    if (!somiti) throw new ApiError(404, 'Somiti not found');

    if (input.name) somiti.name = input.name as string;
    if (input.address !== undefined) somiti.address = input.address as string;
    if (input.phone !== undefined) somiti.phone = input.phone as string;
    if (input.email !== undefined) somiti.email = input.email as string;
    if (input.registrationNo !== undefined) {
      somiti.registrationNo = input.registrationNo as string;
    }
    if (typeof input.isActive === 'boolean' && actor.role === ROLES.SUPER_ADMIN) {
      somiti.isActive = input.isActive;
    }
    if (input.settings) {
      somiti.settings = { ...somiti.settings, ...(input.settings as object) };
    }
    if (input.subscription && actor.role === ROLES.SUPER_ADMIN) {
      const sub = input.subscription as {
        plan?: string;
        status?: 'trial' | 'active' | 'expired' | 'cancelled';
        expiresAt?: string;
      };
      if (sub.plan) somiti.subscription.plan = sub.plan;
      if (sub.status) somiti.subscription.status = sub.status;
      if (sub.expiresAt) somiti.subscription.expiresAt = new Date(sub.expiresAt);
    }

    await somiti.save();
    return somiti;
  },
};
