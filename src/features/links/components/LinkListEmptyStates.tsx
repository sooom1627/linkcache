import { useRouter } from "expo-router";

import {
  ArrowRight,
  BookCheck,
  Coffee,
  Inbox,
  Library,
  Plus,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";

import { EmptyState } from "@/src/shared/components/EmptyState";
import { colors } from "@/src/shared/constants/colors";
import { useModal } from "@/src/shared/providers/ModalContext";

/** Soon タブ用の空状態（全部読みおわった + 次の情報を取り入れよう） */
export function EmptyReadSoon() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <EmptyState
      icon={<Coffee size={40} color={colors.iconMuted} strokeWidth={1.5} />}
      title={t("links.dashboard.empty_read_soon.title")}
      description={t("links.dashboard.empty_read_soon.description")}
      actionLabel={t("links.dashboard.empty_read_soon.go_to_triage")}
      onAction={() => router.push("/swipes")}
      actionIcon={
        <ArrowRight size={20} color={colors.accent} strokeWidth={1.5} />
      }
      ctaVariant="primary"
      variant="centered"
    />
  );
}

/** Add (Latest) タブ用の空状態（興味があるでOK、気になるものを探そう） */
export function EmptyLatest() {
  const { t } = useTranslation();
  const { openModal } = useModal();

  return (
    <EmptyState
      icon={<Inbox size={40} color={colors.iconMuted} strokeWidth={1.5} />}
      title={t("links.dashboard.empty_latest.title")}
      description={t("links.dashboard.empty_latest.description")}
      actionLabel={t("links.dashboard.empty_latest.add_link")}
      onAction={() => openModal("linkCreate")}
      actionIcon={<Plus size={20} color={colors.accent} strokeWidth={2.5} />}
      ctaVariant="primary"
      variant="centered"
    />
  );
}

/** Stock タブ用の空状態（興味のライブラリ、読まなくてもいい） */
export function EmptyStock() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <EmptyState
      icon={<Library size={40} color={colors.iconMuted} strokeWidth={1.5} />}
      title={t("links.dashboard.empty_stock.title")}
      description={t("links.dashboard.empty_stock.description")}
      actionLabel={t("links.dashboard.empty_stock.go_to_triage")}
      onAction={() => router.push("/swipes")}
      actionIcon={
        <ArrowRight size={20} color={colors.accent} strokeWidth={1.5} />
      }
      ctaVariant="primary"
      variant="centered"
    />
  );
}

/** Done タブ用の空状態（よく読んだね） */
export function EmptyDone() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <EmptyState
      icon={<BookCheck size={40} color={colors.iconMuted} strokeWidth={1.5} />}
      title={t("links.dashboard.empty_done.title")}
      description={t("links.dashboard.empty_done.description")}
      actionLabel={t("links.dashboard.empty_done.go_to_triage")}
      onAction={() => router.push("/swipes")}
      actionIcon={
        <ArrowRight size={20} color={colors.accent} strokeWidth={1.5} />
      }
      ctaVariant="primary"
      variant="centered"
    />
  );
}
