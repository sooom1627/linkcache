import { useCallback, useRef, useState } from "react";

import { View } from "react-native";

import PagerView from "react-native-pager-view";

import { LinkListTabContent } from "../components/LinkListTabContent";
import { LinkListTabHeader } from "../components/LinkListTabHeader";
import { listTabsLimit } from "../constants/listTabs";
import { useLinks } from "../hooks/useLinks";
import type { TabType } from "../types/linkList.types";

/** Tab index mapping */
const TAB_INDEX: Record<TabType, number> = {
  read_soon: 0,
  latest: 1,
  stock: 2,
  done: 3,
};

/** Reverse lookup from position to TabType (derived from TAB_INDEX) */
const TAB_BY_INDEX: Record<number, TabType> = Object.fromEntries(
  (Object.entries(TAB_INDEX) as [TabType, number][]).map(([tab, index]) => [
    index,
    tab,
  ]),
);

/**
 * Link list tab component.
 *
 * Displays filtered link list via swipe and tab switching.
 */

export function LinkListTabs() {
  const [activeTab, setActiveTab] = useState<TabType>("read_soon");
  const pagerRef = useRef<PagerView>(null);

  // Read Soon tab: status="read_soon", limit=DASHBOARD_LIMIT
  const readSoonQuery = useLinks({
    status: "read_soon",
    limit: listTabsLimit,
    isRead: false,
  });
  // Latest tab: limit=DASHBOARD_LIMIT (new status)
  const latestQuery = useLinks({
    limit: listTabsLimit,
    isRead: false,
    status: "new",
  });
  // Stock tab: status="stock"
  const stockQuery = useLinks({
    status: "stock",
    limit: listTabsLimit,
  });
  // Done tab: status="done"
  const doneQuery = useLinks({
    status: "done",
    limit: listTabsLimit,
  });

  // Tab switching from header
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    pagerRef.current?.setPage(TAB_INDEX[tab]);
  }, []);

  // Page switching from swipe
  const handlePageSelected = useCallback(
    (e: { nativeEvent: { position: number } }) => {
      const newTab =
        TAB_BY_INDEX[e.nativeEvent.position] ?? ("read_soon" as TabType);
      setActiveTab(newTab);
    },
    [],
  );

  return (
    <View className="flex-1 flex-col">
      <LinkListTabHeader activeTab={activeTab} onTabChange={handleTabChange} />
      <PagerView
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={TAB_INDEX[activeTab]}
        onPageSelected={handlePageSelected}
      >
        {/* Read Soon tab */}
        <View key="read_soon" className="flex-1">
          <LinkListTabContent
            isLoading={readSoonQuery.isLoading}
            isError={readSoonQuery.isError}
            error={readSoonQuery.error}
            links={readSoonQuery.links}
            tabType="read_soon"
          />
        </View>

        {/* Latest tab */}
        <View key="latest" className="flex-1">
          <LinkListTabContent
            isLoading={latestQuery.isLoading}
            isError={latestQuery.isError}
            error={latestQuery.error}
            links={latestQuery.links}
            tabType="latest"
          />
        </View>

        {/* Stock tab */}
        <View key="stock" className="flex-1">
          <LinkListTabContent
            isLoading={stockQuery.isLoading}
            isError={stockQuery.isError}
            error={stockQuery.error}
            links={stockQuery.links}
            tabType="stock"
          />
        </View>

        {/* Done tab */}
        <View key="done" className="flex-1">
          <LinkListTabContent
            isLoading={doneQuery.isLoading}
            isError={doneQuery.isError}
            error={doneQuery.error}
            links={doneQuery.links}
            tabType="done"
          />
        </View>
      </PagerView>
    </View>
  );
}
