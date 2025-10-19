import type { LucideIcon } from "lucide-react-native";

export type TabPath = "/" | "/swipes" | "/link-list" | "/dashboard";

export type Tabs = {
  name: string;
  href: TabPath;
  icon: LucideIcon;
}[];
