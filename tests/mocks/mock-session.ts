/**
 * Mock session for authenticated requests during testing
 */
export const mockSessionUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  organizationId: 'test-org-123',
  role: 'RISK_MANAGER',
};

export const mockSession = {
  user: mockSessionUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Mock admin session for admin-only routes
 */
export const mockAdminUser = {
  id: 'admin-user-123',
  email: 'admin@example.com',
  name: 'Admin User',
  organizationId: 'test-org-123',
  role: 'ADMIN',
};

export const mockAdminSession = {
  user: mockAdminUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Mock viewer session for low-privilege tests
 */
export const mockViewerUser = {
  id: 'viewer-user-123',
  email: 'viewer@example.com',
  name: 'Viewer User',
  organizationId: 'test-org-123',
  role: 'VIEWER',
};

export const mockViewerSession = {
  user: mockViewerUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

/**
 * Mock organization data
 */
export const mockOrganization = {
  id: 'test-org-123',
  name: 'Test Organization',
  createdAt: new Date(),
  updatedAt: new Date(),
};

/**
 * Mock user data
 */
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  organizationId: 'test-org-123',
  role: 'RISK_MANAGER',
  createdAt: new Date(),
  updatedAt: new Date(),
  organization: mockOrganization,
};
