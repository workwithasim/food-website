export enum Permission {
  // Staff / Roles
  MANAGE_STAFF = 'manage_staff',
  VIEW_STAFF = 'view_staff',

  // Branches
  MANAGE_BRANCHES = 'manage_branches',
  VIEW_BRANCHES = 'view_branches',

  // Catalog
  MANAGE_CATALOG = 'manage_catalog',
  VIEW_CATALOG = 'view_catalog',
  MANAGE_CATEGORIES = 'manage_categories',
  VIEW_CATEGORIES = 'view_categories',
  MANAGE_PRODUCTS = 'manage_products',
  VIEW_PRODUCTS = 'view_products',

  // Orders
  MANAGE_ORDERS = 'manage_orders',
  VIEW_ORDERS = 'view_orders',

  // Settings
  MANAGE_SETTINGS = 'manage_settings',
  VIEW_SETTINGS = 'view_settings',
}

export const ALL_PERMISSIONS = Object.values(Permission);
