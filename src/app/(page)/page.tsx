"use client";

import { useAuth } from "@/providers/AuthProvider";
import styles from "./page.module.scss";
import dynamic from "next/dynamic";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useState, useMemo, useCallback, Suspense } from "react";
import { useFetchBunchData } from "@/hooks/useFetchBunchData";
import { SpinnerLoader } from "@/components/global/SpinnerLoader/SpinnerLoader";
import React from "react";

const Tabs = dynamic(() => import("./Tabs/Tabs"), { ssr: false });
const GraphsList = dynamic(() => import("@/components/ui/GraphsList/GraphsList"), { ssr: false });
const GraphView = dynamic(() => import("./GraphView/GraphView"), { ssr: false });

const Homepage = () => {
  const { user } = useAuth();
  const isAuth = Boolean(user && Object.keys(user).length > 0);

  const [activeTab, setActiveTab] = useState<"main" | "graphSystem">("main");
  const [searchQuery, setSearchQuery] = useState("");

  const serverRequest = useMemo(
    () => (isAuth ? "graph/getParentGraphsAuth" : "graph/getParentGraphs"),
    [isAuth]
  );

  const { allPosts: allGraphs, isPostsFetching, isEndPosts, loaderRef, error } =
    useFetchBunchData(serverRequest, [], isAuth);

  const filteredGraphs = useMemo(() => {
    if (!searchQuery) return allGraphs;
    return allGraphs.filter((graph) =>
      graph.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allGraphs, searchQuery]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as "main" | "graphSystem");
  }, []);
  

  return (
    <>
      {/* Шапка: Табы + Поиск */}
      <div className={styles.headerPart}>
        <Tabs
          tabs={[
            { name: "main", label: "Объединения" },
            { name: "graphSystem", label: "Система графов" },
          ]}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
        />

        <div className={styles.inputBlock}>
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Контент в зависимости от активного таба */}
      <div className={styles.contentWrapper}>
        {activeTab === "main" ? (
          <div className={styles.postsList}>
            {isPostsFetching && !isEndPosts && <SpinnerLoader />}
            {allGraphs.length > 0 && (
              <Suspense fallback={<SpinnerLoader />}>
                <MemoizedGraphsList allGraphs={filteredGraphs} />
              </Suspense>
            )}
            <div ref={loaderRef} />
          </div>
        ) : (
          <Suspense fallback={<SpinnerLoader />}>
            <MemoizedGraphView searchQuery={searchQuery} />
          </Suspense>
        )}
      </div>
    </>
  );
};

const MemoizedGraphsList = React.memo(GraphsList);
const MemoizedGraphView = React.memo(GraphView);

export default Homepage;
