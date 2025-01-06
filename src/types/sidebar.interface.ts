import { JSX } from "react"

// Какие данные принимает sidebar
export interface IArrayItem {
    id: number
    icon: JSX.Element
    title: string
    notAuthAllow: boolean
    path: string
}