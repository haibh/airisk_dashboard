import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, hasMinimumRole, hashPassword } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  forbiddenError,
  validationError,
} from '@/lib/api-error-handler';
import { userFilterSchema, validateBody, formatZodErrors } from '@/lib/api-validation-schemas';
import { z } from 'zod';

/**
 * GET /api/users - List users in organization
 * ADMIN only, paginated with filters
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check ADMIN role
    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can list users');
    }

    const { searchParams } = new URL(request.url);
    const filters = {
      page: searchParams.get('page'),
      pageSize: searchParams.get('pageSize'),
      search: searchParams.get('search'),
      role: searchParams.get('role'),
      isActive: searchParams.get('isActive'),
    };

    // Validate filters
    const validation = validateBody(userFilterSchema, filters);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const { page, pageSize, search, role, isActive } = validation.data;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {
      organizationId: session.user.organizationId,
    };

    if (role) {
      where.role = role;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
        image: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    });

    return NextResponse.json({
      success: true,
      data: users,
      total,
      page,
      pageSize,
    });
  } catch (error) {
    return handleApiError(error, 'listing users');
  }
}

/**
 * POST /api/users - Create user directly
 * ADMIN only
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    // Check ADMIN role
    if (!hasMinimumRole(session.user.role, 'ADMIN')) {
      return forbiddenError('Only administrators can create users');
    }

    const body = await request.json();

    // Define create user schema
    const createUserSchema = z.object({
      email: z.string().email('Invalid email address').max(255),
      name: z.string().min(1, 'Name is required').max(255),
      password: z.string().min(8, 'Password must be at least 8 characters').max(128),
      role: z.enum(['ADMIN', 'RISK_MANAGER', 'ASSESSOR', 'AUDITOR', 'VIEWER']).optional().default('VIEWER'),
    });

    // Validate request body
    const validation = validateBody(createUserSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const data = validation.data;

    // Check email uniqueness within organization
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        organizationId: session.user.organizationId,
      },
    });

    if (existingUser) {
      return validationError('User with this email already exists in your organization');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
        organizationId: session.user.organizationId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Write audit log
    await prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entityType: 'User',
        entityId: newUser.id,
        oldValues: {},
        newValues: { email: newUser.email, name: newUser.name, role: newUser.role },
        userId: session.user.id,
        organizationId: session.user.organizationId,
      },
    });

    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    return handleApiError(error, 'creating user');
  }
}
