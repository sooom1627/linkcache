import type { LucideIcon } from "lucide-react-native";

export type TabPath = "/" | "/swipes" | "/link-list" | "/dashboard";

export interface TabItem {
  name: string;
  href: TabPath;
  icon: LucideIcon;
}

export type Tabs = TabItem[];
