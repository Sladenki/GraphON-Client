"use client";

import MenuItem from "./MenuItem/MenuItem";
import { usePathname } from 'next/navigation';
import styles from './RenderMenuList.module.scss'
import { IArrayItem } from "@/types/sidebar.interface";


const RenderMenuList: React.FC<{arrayItems: IArrayItem[], small: boolean}> = ({ arrayItems, small }) => {

    // const { data: session } = useSession()

    const pathname  = usePathname()

    const menuWidth = small ? 85 : 200;

    return(
        <div style={{ width: menuWidth }} className={styles.listMenu}>
          {arrayItems.map(({ id, icon, title, notAuthAllow, path }) => {
            const isActive = pathname === path;

            // const shouldRender = !!session || notAuthAllow;

            const shouldRender = true

            return shouldRender ? (
              <MenuItem key={id} id={id} icon={icon} title={title} path={path} isActive={isActive} small={small} />
            ) : null;
          })}
      </div>
    )    

};


export default RenderMenuList
