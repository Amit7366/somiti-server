import { ROLES } from '../../constants/roles';
import { ApiError } from '../../utils/ApiError';
import { TokenPayload } from '../../utils/token';
import { Area } from '../area/area.model';
import { Member, type INominee } from './member.model';

const POPULATE = [
  { path: 'area', select: 'name' },
  { path: 'branch', select: 'name code' },
  { path: 'assignedStaff', select: 'name phone role' },
  { path: 'createdBy', select: 'name phone role' },
  { path: 'somiti', select: 'name code' },
];

function somitiIdOf(actor: TokenPayload) {
  if (actor.role === ROLES.SUPER_ADMIN) return undefined;
  if (!actor.somitiId) throw new ApiError(400, 'Somiti is required');
  return actor.somitiId;
}

/** Works for raw ObjectId and populated refs ({ _id }). */
function refId(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const doc = value as { _id?: unknown; id?: unknown };
    if (doc._id != null) return String(doc._id);
    if (doc.id != null) return String(doc.id);
  }
  return String(value);
}

function assertSameSomiti(actor: TokenPayload, somitiRef: unknown) {
  if (actor.role === ROLES.SUPER_ADMIN) return;
  if (!actor.somitiId || refId(somitiRef) !== actor.somitiId) {
    throw new ApiError(403, 'Member is outside your somiti');
  }
}

async function nextMemberCode(somitiId: string) {
  const count = await Member.countDocuments({ somiti: somitiId });
  return `M-${String(count + 1).padStart(4, '0')}`;
}

function nextPassbookNo(code: string) {
  const digits = code.replace(/\D/g, '') || '1';
  return `PB-${digits.padStart(3, '0')}`;
}

function normalizeNominees(nominees: INominee[]) {
  return nominees.map((nominee, index) => ({
    ...nominee,
    photoUrl: nominee.photoUrl || undefined,
    signatureUrl: nominee.signatureUrl || undefined,
    isPrimary: index === 0 ? true : Boolean(nominee.isPrimary),
  }));
}

export const memberService = {
  async list(actor: TokenPayload, query: { areaId?: string; status?: string; search?: string }) {
    const filter: Record<string, unknown> = {};
    const somitiId = somitiIdOf(actor);
    if (somitiId) filter.somiti = somitiId;
    if (query.areaId) filter.area = query.areaId;
    if (query.status) filter.status = query.status;
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { mobile: { $regex: query.search, $options: 'i' } },
        { code: { $regex: query.search, $options: 'i' } },
        { nid: { $regex: query.search, $options: 'i' } },
      ];
    }

    return Member.find(filter).populate(POPULATE).sort({ createdAt: -1 });
  },

  async getById(actor: TokenPayload, id: string) {
    const member = await Member.findById(id).populate(POPULATE);
    if (!member) throw new ApiError(404, 'Member not found');
    assertSameSomiti(actor, member.somiti);
    return member;
  },

  async create(
    actor: TokenPayload,
    input: {
      name: string;
      mobile: string;
      category?: string;
      status?: string;
      joinDate?: string;
      address?: string;
      areaId?: string;
      branchId?: string;
      assignedStaffId?: string;
      nid?: string;
      fatherOrHusbandName?: string;
      motherOrWifeName?: string;
      annualIncome?: number;
      photoUrl?: string;
      signatureUrl?: string;
      nidFrontUrl?: string;
      nidBackUrl?: string;
      nominees: INominee[];
    }
  ) {
    const somitiId = actor.role === ROLES.SUPER_ADMIN ? actor.somitiId : actor.somitiId;
    if (!somitiId) throw new ApiError(400, 'Somiti is required');

    if (input.areaId) {
      const area = await Area.findById(input.areaId);
      if (!area) throw new ApiError(404, 'Area not found');
      if (area.somiti.toString() !== somitiId) {
        throw new ApiError(400, 'Area does not belong to your somiti');
      }
    }

    const exists = await Member.findOne({ somiti: somitiId, mobile: input.mobile.trim() });
    if (exists) throw new ApiError(409, 'A member with this mobile already exists');

    const code = await nextMemberCode(somitiId);
    const member = await Member.create({
      code,
      passbookNo: nextPassbookNo(code),
      name: input.name.trim(),
      mobile: input.mobile.trim(),
      category: input.category || 'GENERAL',
      status: input.status || 'ACTIVE',
      joinDate: input.joinDate ? new Date(input.joinDate) : new Date(),
      address: input.address,
      area: input.areaId,
      branch: input.branchId || actor.branchId,
      assignedStaff: input.assignedStaffId,
      createdBy: actor.id,
      nid: input.nid,
      fatherOrHusbandName: input.fatherOrHusbandName,
      motherOrWifeName: input.motherOrWifeName,
      annualIncome: input.annualIncome,
      photoUrl: input.photoUrl,
      signatureUrl: input.signatureUrl,
      nidFrontUrl: input.nidFrontUrl,
      nidBackUrl: input.nidBackUrl,
      nominees: normalizeNominees(input.nominees),
      somiti: somitiId,
      accountControls: {
        profileFrozen: false,
        savingsFrozen: false,
        dpsFrozen: false,
        fdrFrozen: false,
        loanFrozen: false,
      },
    });

    return member.populate(POPULATE);
  },

  async update(
    actor: TokenPayload,
    id: string,
    input: Record<string, unknown>
  ) {
    const member = await Member.findById(id);
    if (!member) throw new ApiError(404, 'Member not found');
    assertSameSomiti(actor, member.somiti);

    if (typeof input.name === 'string') member.name = input.name.trim();
    if (typeof input.mobile === 'string') member.mobile = input.mobile.trim();
    if (typeof input.category === 'string') member.category = input.category as never;
    if (typeof input.status === 'string') member.status = input.status as never;
    if (typeof input.joinDate === 'string') member.joinDate = new Date(input.joinDate);
    if (typeof input.address === 'string') member.address = input.address;
    if (input.areaId !== undefined) member.area = input.areaId ? (input.areaId as never) : undefined;
    if (input.branchId !== undefined) {
      member.branch = input.branchId ? (input.branchId as never) : undefined;
    }
    if (input.assignedStaffId !== undefined) {
      member.assignedStaff = input.assignedStaffId ? (input.assignedStaffId as never) : undefined;
    }
    if (typeof input.nid === 'string') member.nid = input.nid;
    if (typeof input.fatherOrHusbandName === 'string') {
      member.fatherOrHusbandName = input.fatherOrHusbandName;
    }
    if (typeof input.motherOrWifeName === 'string') {
      member.motherOrWifeName = input.motherOrWifeName;
    }
    if (typeof input.annualIncome === 'number') member.annualIncome = input.annualIncome;
    if (typeof input.photoUrl === 'string') member.photoUrl = input.photoUrl;
    if (typeof input.signatureUrl === 'string') member.signatureUrl = input.signatureUrl;
    if (typeof input.nidFrontUrl === 'string') member.nidFrontUrl = input.nidFrontUrl;
    if (typeof input.nidBackUrl === 'string') member.nidBackUrl = input.nidBackUrl;
    if (Array.isArray(input.nominees)) {
      member.nominees = normalizeNominees(input.nominees as INominee[]);
    }
    if (typeof input.isActive === 'boolean') member.isActive = input.isActive;
    if (typeof input.admissionFee === 'number') member.admissionFee = input.admissionFee;
    if (typeof input.permanentAddress === 'string') member.permanentAddress = input.permanentAddress;
    if (typeof input.gender === 'string') member.gender = input.gender;
    if (typeof input.dateOfBirth === 'string') member.dateOfBirth = new Date(input.dateOfBirth);
    if (typeof input.occupation === 'string') member.occupation = input.occupation;
    if (input.accountControls && typeof input.accountControls === 'object') {
      const controls = input.accountControls as Record<string, unknown>;
      member.accountControls = {
        profileFrozen: Boolean(controls.profileFrozen),
        savingsFrozen: Boolean(controls.savingsFrozen),
        dpsFrozen: Boolean(controls.dpsFrozen),
        fdrFrozen: Boolean(controls.fdrFrozen),
        loanFrozen: Boolean(controls.loanFrozen),
      };
    }

    await member.save();
    return member.populate(POPULATE);
  },
};
