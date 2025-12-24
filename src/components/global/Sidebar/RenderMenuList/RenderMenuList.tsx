"use client";

import MenuItem from "./MenuItem/MenuItem";
import { usePathname } from 'next/navigation';
import styles from './RenderMenuList.module.scss'
import { IArrayItem } from "@/types/sidebar.interface";
import { useAuth } from "@/providers/AuthProvider";
import { UserRole } from "@/types/user.interface";
import { CITY_ROUTE, GRAPHS_ROUTE } from "@/constants/sidebar";


const RenderMenuList: React.FC<{arrayItems: IArrayItem[], small: boolean}> = ({ arrayItems, small }) => {

  const { user, isLoggedIn } = useAuth();
  const pathname  = usePathname()
  const menuWidth = small ? 85 : 200;

  // Группируем элементы по требованию
  const primaryPaths = new Set(['/', '/groups/', '/events/', GRAPHS_ROUTE, CITY_ROUTE]);
  const group1 = arrayItems.filter(({ path }) => primaryPaths.has(path));
  const group2 = arrayItems.filter(({ path }) => ['/profile'].includes(path))
    .sort((a, b) => {
      const order = ['/profile'];
      return order.indexOf(a.path) - order.indexOf(b.path);
    });
  const group3 = arrayItems.filter(({ path }) => ['/admin/'].includes(path));

  const renderGroup = (items: IArrayItem[]) => {
    const filteredItems = items.filter(({ forAuthUsers, path }) => {
      let shouldRender = !forAuthUsers || (forAuthUsers && isLoggedIn);
      if (path === '/admin/' && user?.role === UserRole.User) shouldRender = false;
      return shouldRender;
    });

    if (filteredItems.length === 0) return null;

    return (
      <div className={styles.group}>
        {filteredItems.map(({ id, icon, title, path }) => {
          const isActive = pathname === path;
          return (
            <MenuItem key={id} id={id} icon={icon} title={title} path={path} isActive={isActive} small={small} />
          );
        })}
      </div>
    );
  };

  const renderedGroup1 = renderGroup(group1);
  const renderedGroup2 = renderGroup(group2);
  const renderedGroup3 = renderGroup(group3);

  return(
    <div style={{ width: menuWidth }} className={styles.listMenu}>
      {renderedGroup1}
      {renderedGroup1 && renderedGroup2 && <div className={styles.divider} />}
      {renderedGroup2}
      {(renderedGroup1 || renderedGroup2) && renderedGroup3 && <div className={styles.divider} />}
      {renderedGroup3}
    </div>
  )    

};


export default RenderMenuList
