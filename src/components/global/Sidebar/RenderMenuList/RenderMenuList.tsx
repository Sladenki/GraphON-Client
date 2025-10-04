"use client";

import MenuItem from "./MenuItem/MenuItem";
import { usePathname } from 'next/navigation';
import styles from './RenderMenuList.module.scss'
import { IArrayItem } from "@/types/sidebar.interface";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/user.interface";


const RenderMenuList: React.FC<{arrayItems: IArrayItem[], small: boolean}> = ({ arrayItems, small }) => {

  const { user, isLoggedIn } = useAuth();
  const pathname  = usePathname()
  const menuWidth = small ? 85 : 200;

  // Группируем элементы по требованию
  const group1 = arrayItems.filter(({ path }) => ['/', '/groups/', '/events/', '/graphs/'].includes(path));
  const group2 = arrayItems.filter(({ path }) => ['/profile', '/schedule/', '/subs/'].includes(path))
    .sort((a, b) => {
      const order = ['/profile', '/schedule/', '/subs/'];
      return order.indexOf(a.path) - order.indexOf(b.path);
    });
  const group3 = arrayItems.filter(({ path }) => ['/manage/', '/admin/'].includes(path));

  const renderGroup = (items: IArrayItem[]) => (
    <div className={styles.group}>
      {items.map(({ id, icon, title, forAuthUsers, path }) => {
        const isActive = pathname === path;

        let shouldRender = !forAuthUsers || (forAuthUsers && isLoggedIn);
        if (path === '/admin/' && user?.role === UserRole.User) shouldRender = false;

        return shouldRender ? (
          <MenuItem key={id} id={id} icon={icon} title={title} path={path} isActive={isActive} small={small} />
        ) : null;
      })}
    </div>
  );

  return(
    <div style={{ width: menuWidth }} className={styles.listMenu}>
      {renderGroup(group1)}
      <div className={styles.divider} />
      {renderGroup(group2)}
      <div className={styles.divider} />
      {renderGroup(group3)}
    </div>
  )    

};


export default RenderMenuList
