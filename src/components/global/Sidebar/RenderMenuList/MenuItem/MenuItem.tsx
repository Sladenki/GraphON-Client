import Link from "next/link";
import styles from './MenuItem.module.scss'

type Item = {
    id: number, 
    icon: any, 
    title: string, 
    path: string, 
    isActive: boolean, 
    small: boolean
}

const MenuItem = ({id, icon, title, path, isActive, small }: Item) => {

    return (
        <Link key={id} href={path}>
            <div
                key={id}
                style={{ width: !small ? '200px' : '50px' }}
                className={isActive ? styles.listLineActive : styles.listLine}
            >
            <span className={styles.icon}>{icon}</span>

            {!small && (
                <span className={isActive ? styles.active : undefined}>
                    <div className={styles.text}>{title}</div>
                </span>
            )}
            
            </div>
        </Link>
    )

};

export default MenuItem