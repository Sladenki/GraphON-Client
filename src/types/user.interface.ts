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

export interface IUser {
    name: string
    avaPath: string
}