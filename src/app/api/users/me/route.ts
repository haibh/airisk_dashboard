import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth-helpers';
import { prisma } from '@/lib/db';
import {
  handleApiError,
  unauthorizedError,
  validationError,
} from '@/lib/api-error-handler';
import { updateProfileSchema, validateBody, formatZodErrors } from '@/lib/api-validation-schemas';

/**
 * GET /api/users/me - Get current user profile with org info
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        languagePref: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            settings: true,
          },
        },
      },
    });

    if (!user) {
      return unauthorizedError();
    }

    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error, 'fetching current user profile');
  }
}

/**
 * PUT /api/users/me - Update current user profile
 * Update name, languagePref, image only
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return unauthorizedError();
    }

    const body = await request.json();

    // Validate request body
    const validation = validateBody(updateProfileSchema, body);
    if (!validation.success) {
      return validationError(formatZodErrors(validation.error));
    }

    const data = validation.data;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.languagePref !== undefined && { languagePref: data.languagePref }),
        ...(data.image !== undefined && { image: data.image ?? null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        languagePref: true,
        image: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error, 'updating profile');
  }
}
