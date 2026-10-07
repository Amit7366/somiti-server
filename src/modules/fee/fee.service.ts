import { ROLES } from '../../constants/roles';
import { ApiError } from '../../utils/ApiError';
import { TokenPayload } from '../../utils/token';
import { Member } from '../member/member.model';
import { FeeCollection, type FeeType } from './fee.model';

const POPULATE = [
  { path: 'member', select: 'code name mobile photoUrl fatherOrHusbandName joinDate status category area' },
  { path: 'area', select: 'name' },
  { path: 'branch', select: 'name code' },
  { path: 'somiti', select: 'name code address phone registrationNo' },
  { path: 'collectedBy', select: 'name phone role' },
];

function somitiIdOf(actor: TokenPayload) {
  if (actor.role === ROLES.SUPER_ADMIN) return undefined;
  if (!actor.somitiId) throw new ApiError(400, 'Somiti is required');
  return actor.somitiId;
}

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
    throw new ApiError(403, 'Fee record is outside your somiti');
  }
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

async function nextReceiptNo(somitiId: string, date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const prefix = `SC-${y}${m}${d}-`;
  const count = await FeeCollection.countDocuments({
    somiti: somitiId,
    receiptNo: { $regex: `^${prefix}` },
  });
  return `${prefix}${String(count + 1).padStart(3, '0')}`;
}

function totalOf(feeAmount: number, stampFee: number, otherFee: number) {
  return Number((feeAmount + stampFee + otherFee).toFixed(2));
}

export const feeService = {
  async list(
    actor: TokenPayload,
    query: {
      areaId?: string;
      feeType?: string;
      search?: string;
      from?: string;
      to?: string;
      status?: string;
    }
  ) {
    const filter: Record<string, unknown> = {};
    const somitiId = somitiIdOf(actor);
    if (somitiId) filter.somiti = somitiId;
    if (query.areaId) filter.area = query.areaId;
    if (query.feeType) filter.feeType = query.feeType;
    if (query.status) filter.status = query.status;

    if (query.from || query.to) {
      const range: { $gte?: Date; $lte?: Date } = {};
      if (query.from) range.$gte = startOfDay(new Date(query.from));
      if (query.to) range.$lte = endOfDay(new Date(query.to));
      filter.collectionDate = range;
    }

    if (query.search?.trim()) {
      const q = query.search.trim();
      const members = await Member.find({
        ...(somitiId ? { somiti: somitiId } : {}),
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { mobile: { $regex: q, $options: 'i' } },
          { code: { $regex: q, $options: 'i' } },
        ],
      })
        .select('_id')
        .lean();
      const memberIds = members.map((m) => m._id);
      filter.$or = [{ receiptNo: { $regex: q, $options: 'i' } }, { member: { $in: memberIds } }];
    }

    return FeeCollection.find(filter).populate(POPULATE).sort({ collectionDate: -1, createdAt: -1 });
  },

  async summary(actor: TokenPayload) {
    const filter: Record<string, unknown> = { status: 'COMPLETED' };
    const somitiId = somitiIdOf(actor);
    if (somitiId) filter.somiti = somitiId;

    const all = await FeeCollection.find(filter).select('feeType feeAmount stampFee otherFee totalAmount collectionDate').lean();
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const today = all.filter((f) => {
      const d = new Date(f.collectionDate);
      return d >= todayStart && d <= todayEnd;
    });

    const sum = (rows: typeof all) => rows.reduce((acc, r) => acc + (r.totalAmount || 0), 0);
    const byType = (type: FeeType) => all.filter((r) => r.feeType === type);

    const total = sum(all);
    const service = sum(byType('SERVICE_CHARGE'));
    const admissionLike = sum([...byType('ADMISSION'), ...byType('FORM'), ...byType('OTHER'), ...byType('LATE')]);

    return {
      totalAmount: total,
      totalEntries: all.length,
      todayAmount: sum(today),
      todayEntries: today.length,
      serviceChargeAmount: service,
      admissionOtherAmount: admissionLike,
      dailyTarget: 3000,
    };
  },

  async getById(actor: TokenPayload, id: string) {
    const fee = await FeeCollection.findById(id).populate(POPULATE);
    if (!fee) throw new ApiError(404, 'Fee collection not found');
    assertSameSomiti(actor, fee.somiti);
    return fee;
  },

  async create(
    actor: TokenPayload,
    input: {
      memberId: string;
      areaId?: string;
      collectionDate?: string;
      feeType: FeeType;
      feeAmount: number;
      stampFee?: number;
      otherFee?: number;
      paymentMethod?: 'CASH' | 'MFS' | 'BANK';
      remarks?: string;
      status?: 'DRAFT' | 'COMPLETED';
      printReceipt?: boolean;
      sendSms?: boolean;
    }
  ) {
    const somitiId = actor.somitiId;
    if (actor.role !== ROLES.SUPER_ADMIN && !somitiId) {
      throw new ApiError(400, 'Somiti is required');
    }

    const member = await Member.findById(input.memberId);
    if (!member) throw new ApiError(404, 'Member not found');
    assertSameSomiti(actor, member.somiti);

    const collectionDate = input.collectionDate ? new Date(input.collectionDate) : new Date();
    if (Number.isNaN(collectionDate.getTime())) throw new ApiError(400, 'Invalid collection date');

    const feeAmount = Number(input.feeAmount || 0);
    const stampFee = Number(input.stampFee || 0);
    const otherFee = Number(input.otherFee || 0);
    if (feeAmount + stampFee + otherFee <= 0) {
      throw new ApiError(400, 'Total fee must be greater than zero');
    }

    const somiti = somitiId || refId(member.somiti);
    const receiptNo = await nextReceiptNo(somiti, collectionDate);

    const fee = await FeeCollection.create({
      receiptNo,
      collectionDate,
      feeType: input.feeType,
      feeAmount,
      stampFee,
      otherFee,
      totalAmount: totalOf(feeAmount, stampFee, otherFee),
      paymentMethod: input.paymentMethod || 'CASH',
      remarks: input.remarks?.trim() || undefined,
      status: input.status || 'COMPLETED',
      printReceipt: input.printReceipt !== false,
      sendSms: Boolean(input.sendSms),
      member: member._id,
      area: input.areaId || member.area,
      branch: member.branch,
      somiti,
      collectedBy: actor.id,
    });

    return fee.populate(POPULATE);
  },

  async update(
    actor: TokenPayload,
    id: string,
    input: {
      collectionDate?: string;
      feeType?: FeeType;
      feeAmount?: number;
      stampFee?: number;
      otherFee?: number;
      paymentMethod?: 'CASH' | 'MFS' | 'BANK';
      remarks?: string;
      status?: 'DRAFT' | 'COMPLETED';
      printReceipt?: boolean;
      sendSms?: boolean;
    }
  ) {
    const fee = await FeeCollection.findById(id);
    if (!fee) throw new ApiError(404, 'Fee collection not found');
    assertSameSomiti(actor, fee.somiti);

    if (input.collectionDate) {
      const d = new Date(input.collectionDate);
      if (Number.isNaN(d.getTime())) throw new ApiError(400, 'Invalid collection date');
      fee.collectionDate = d;
    }
    if (input.feeType) fee.feeType = input.feeType;
    if (typeof input.feeAmount === 'number') fee.feeAmount = input.feeAmount;
    if (typeof input.stampFee === 'number') fee.stampFee = input.stampFee;
    if (typeof input.otherFee === 'number') fee.otherFee = input.otherFee;
    if (input.paymentMethod) fee.paymentMethod = input.paymentMethod;
    if (typeof input.remarks === 'string') fee.remarks = input.remarks.trim() || undefined;
    if (input.status) fee.status = input.status;
    if (typeof input.printReceipt === 'boolean') fee.printReceipt = input.printReceipt;
    if (typeof input.sendSms === 'boolean') fee.sendSms = input.sendSms;

    fee.totalAmount = totalOf(fee.feeAmount, fee.stampFee, fee.otherFee);
    if (fee.totalAmount <= 0) throw new ApiError(400, 'Total fee must be greater than zero');

    await fee.save();
    return fee.populate(POPULATE);
  },
};
