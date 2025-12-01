// Данные которые есть в гугл аккаунте
export interface IGoogleAuthUser {
    name: string
    email: string
    image: string

}

// Данные которые мы получаем с сервера после авторизации
export interface ISessionUser extends IGoogleAuthUser {
    id: string 
}

export enum UserRole {
    Create = 'create',
    Admin = 'admin',
    Editor = 'editor',
    SysAdmin = 'sysadmin',
    User = 'user',
}

export const RoleTitles: Record<UserRole, string> = {
    [UserRole.Create]: 'Владелец',
    [UserRole.Admin]: 'Администратор',
    [UserRole.Editor]: 'Редактор',
    [UserRole.SysAdmin]: 'Сис.Админ',
    [UserRole.User]: 'Пользователь',
};

export interface IUser {
    _id: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    username: string;
    avaPath: string;
    telegramId: string;
    graphSubsNum: number;
    postsNum: number;
    attentedEventsNum: number;
    selectedGraphId: string | null;
    managedGraphIds?: Array<{ _id: string; name: string }>; 
    gender?: 'male' | 'female';
    birthDate?: string; // ISO date string YYYY-MM-DD
    isStudent?: boolean | null;
}

export interface IUpdateUserDto {
    firstName?: string;
    lastName?: string;
    username?: string;
    gender?: 'male' | 'female';
    birthDate?: string; // ISO date string YYYY-MM-DD
    isStudent?: boolean | null;
}