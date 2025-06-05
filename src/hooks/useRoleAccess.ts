import { UserRole } from '@/types/user.interface';

const RoleHierarchy: Record<UserRole, number> = {
    [UserRole.Create]: 4,
    [UserRole.Admin]: 3,
    [UserRole.Editor]: 2,
    [UserRole.SysAdmin]: 1,
    [UserRole.User]: 0,
};

export const useRoleAccess = (userRole: UserRole | undefined) => {
    const hasAccess = (requiredRole: UserRole): boolean => {
        if (!userRole) return false;
        return RoleHierarchy[userRole] >= RoleHierarchy[requiredRole];
    };

    return {
        hasAccess,
        isCreate: userRole === UserRole.Create,
        isAdmin: userRole === UserRole.Admin,
        isEditor: userRole === UserRole.Editor,
        isSysAdmin: userRole === UserRole.SysAdmin,
        isUser: userRole === UserRole.User,
        
        canAccessEditor: hasAccess(UserRole.Editor),
        canAccessSysAdmin: hasAccess(UserRole.SysAdmin),
        canAccessAdmin: hasAccess(UserRole.Admin),
        canAccessCreate: hasAccess(UserRole.Create)
    };
}; 