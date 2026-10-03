import { ROLES } from '../../constants/roles';
import { TokenPayload } from '../../utils/token';
import { Branch } from '../branch/branch.model';
import { Center } from '../center/center.model';
import { Somiti } from '../somiti/somiti.model';
import { User } from '../user/user.model';

export const dashboardService = {
  async summary(actor: TokenPayload) {
    if (actor.role === ROLES.SUPER_ADMIN) {
      const [somitis, users, activeSomitis] = await Promise.all([
        Somiti.countDocuments(),
        User.countDocuments(),
        Somiti.countDocuments({ isActive: true }),
      ]);

      return {
        scope: 'system',
        cards: [
          { key: 'somitis', label: 'Somitis', value: somitis },
          { key: 'activeSomitis', label: 'Active somitis', value: activeSomitis },
          { key: 'users', label: 'All users', value: users },
        ],
      };
    }

    const somitiFilter = { somiti: actor.somitiId };

    const [members, pending, staff, branches, centers] = await Promise.all([
      User.countDocuments({ ...somitiFilter, role: ROLES.MEMBER }),
      User.countDocuments({ ...somitiFilter, role: ROLES.MEMBER, isApproved: false }),
      User.countDocuments({ ...somitiFilter, role: { $ne: ROLES.MEMBER } }),
      Branch.countDocuments({ somiti: actor.somitiId }),
      Center.countDocuments({ somiti: actor.somitiId, isActive: true }),
    ]);

    const cards = [
      { key: 'members', label: 'Members', value: members },
      { key: 'pending', label: 'Pending approvals', value: pending },
      { key: 'staff', label: 'Staff', value: staff },
      { key: 'branches', label: 'Branches', value: branches },
    ];

    if (actor.role === ROLES.MEMBER) {
      return {
        scope: 'self',
        cards: [
          { key: 'savings', label: 'Savings balance', value: 0, hint: 'Coming next' },
          { key: 'loan', label: 'Loan outstanding', value: 0, hint: 'Coming next' },
          { key: 'installment', label: 'Next installment', value: 0, hint: 'Coming next' },
        ],
      };
    }

    return {
      scope: 'somiti',
      cards,
      metrics: {
        activeMembers: members,
        centers,
        savingsBalance: 0,
        overdueLoan: 0,
        overdueInstallments: 0,
        todayCollection: 0,
        notifications: pending,
      },
      recentTransactions: [],
    };
  },
};
