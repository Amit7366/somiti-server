import { Somiti } from '../somiti/somiti.model';
import { IUser, User } from '../user/user.model';
import { ROLES } from '../../constants/roles';
import { ROLE_PERMISSIONS } from '../../constants/permissions';
import { ApiError } from '../../utils/ApiError';
import { signToken } from '../../utils/token';

function toPublicUser(user: IUser) {
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
    permissions: ROLE_PERMISSIONS[user.role] ?? [],
    createdAt: user.createdAt,
  };
}

async function uniqueSomitiCode(name: string): Promise<string> {
  const letters = name.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 4);
  const prefix = letters.length >= 2 ? letters : 'SMT';
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
    const taken = await Somiti.findOne({ code });
    if (!taken) return code;
  }
  return `SMT${Date.now().toString().slice(-6)}`;
}

function issueToken(user: IUser): string {
  return signToken({
    id: user._id.toString(),
    role: user.role,
    somitiId: user.somiti?.toString(),
    branchId: user.branch?.toString(),
  });
}

export const authService = {
  async register(input: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    somitiCode: string;
    nid?: string;
    address?: string;
  }) {
    const somiti = await Somiti.findOne({
      code: input.somitiCode.toUpperCase(),
      isActive: true,
    });

    if (!somiti) {
      throw new ApiError(404, 'Somiti not found. Check the somiti code.');
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
      email: input.email,
      password: input.password,
      role: ROLES.MEMBER,
      somiti: somiti._id,
      nid: input.nid,
      address: input.address,
      isApproved: false,
      isActive: true,
    });

    const populated = await User.findById(user._id).populate('somiti', 'name code');
    const token = issueToken(user);

    return { user: toPublicUser(populated!), token };
  },

  async registerSomiti(input: {
    institutionName: string;
    somitiType: string;
    address: string;
    contactPhone?: string;
    phone: string;
    password: string;
    plan: string;
  }) {
    const exists = await User.findOne({ phone: input.phone });
    if (exists) {
      throw new ApiError(409, 'An account with this phone already exists');
    }

    const code = await uniqueSomitiCode(input.institutionName);
    const somiti = await Somiti.create({
      name: input.institutionName,
      code,
      address: input.address,
      phone: input.contactPhone || input.phone,
      settings: {
        currency: 'BDT',
        collectionFrequency: 'weekly',
        somitiType: input.somitiType,
      },
      subscription: {
        plan: input.plan === 'trial' ? 'standard' : input.plan,
        status: 'trial',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const user = await User.create({
      name: input.institutionName,
      phone: input.phone,
      password: input.password,
      role: ROLES.SOMITI_ADMIN,
      somiti: somiti._id,
      address: input.address,
      isApproved: true,
      isActive: true,
    });

    somiti.createdBy = user._id;
    await somiti.save();

    const populated = await User.findById(user._id).populate('somiti', 'name code');
    const token = issueToken(user);

    return { user: toPublicUser(populated!), token, somitiCode: code };
  },

  async login(identifier: string, password: string) {
    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { phone: identifier }],
    }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const match = await user.comparePassword(password);
    if (!match) {
      throw new ApiError(401, 'Invalid credentials');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'This account has been deactivated');
    }

    await user.populate('somiti', 'name code');
    await user.populate('branch', 'name code');

    const token = issueToken(user);
    return { user: toPublicUser(user), token };
  },

  async me(userId: string) {
    const user = await User.findById(userId)
      .populate('somiti', 'name code settings subscription')
      .populate('branch', 'name code');

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return toPublicUser(user);
  },
};
