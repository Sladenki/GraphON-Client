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
    User = 'user',
}

export const RoleTitles: Record<UserRole, string> = {
    [UserRole.Create]: 'Владелец',
    [UserRole.Admin]: 'Администратор',
    [UserRole.Editor]: 'Редактор',
    [UserRole.User]: 'Пользователь',
};

export interface IUser {
    name: string
    firstName: string
    lastName: string
    avaPath: string
    postsNum: number
    graphSubsNum: number
    role: UserRole
}