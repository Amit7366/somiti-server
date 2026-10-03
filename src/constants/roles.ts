export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  SOMITI_ADMIN: 'SOMITI_ADMIN',
  SECRETARY: 'SECRETARY',
  CASHIER: 'CASHIER',
  ACCOUNTANT: 'ACCOUNTANT',
  FIELD_OFFICER: 'FIELD_OFFICER',
  BRANCH_MANAGER: 'BRANCH_MANAGER',
  MEMBER: 'MEMBER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LIST = Object.values(ROLES);

export const STAFF_ROLES: Role[] = [
  ROLES.SOMITI_ADMIN,
  ROLES.SECRETARY,
  ROLES.CASHIER,
  ROLES.ACCOUNTANT,
  ROLES.FIELD_OFFICER,
  ROLES.BRANCH_MANAGER,
];

export const ROLE_META: Record<
  Role,
  { label: string; description: string; scope: 'system' | 'somiti' | 'branch' | 'self' }
> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    description: 'Full system control. Creates somitis, subscriptions, and global settings.',
    scope: 'system',
  },
  SOMITI_ADMIN: {
    label: 'Somiti Admin / Chairman',
    description: 'Overall management, member approval, policy setting, reports, and loan approval.',
    scope: 'somiti',
  },
  SECRETARY: {
    label: 'Secretary',
    description: 'Member records, meeting minutes, notices, and daily operations.',
    scope: 'somiti',
  },
  CASHIER: {
    label: 'Cashier / Treasurer',
    description: 'Collections, deposits, withdrawals, expenses, and cashbook.',
    scope: 'somiti',
  },
  ACCOUNTANT: {
    label: 'Accountant',
    description: 'Ledger, vouchers, income-expense, balance sheet, and audit reports.',
    scope: 'somiti',
  },
  FIELD_OFFICER: {
    label: 'Field Officer / Collector',
    description: 'Daily/weekly/monthly savings and installment collection with mobile entry.',
    scope: 'branch',
  },
  BRANCH_MANAGER: {
    label: 'Branch Manager',
    description: 'Branch-level control and reports for multi-branch somitis.',
    scope: 'branch',
  },
  MEMBER: {
    label: 'Member',
    description: 'Own account: savings, loan status, installment schedule, and statements.',
    scope: 'self',
  },
};
