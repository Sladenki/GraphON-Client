"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.scss";
import { Download, Shield } from "lucide-react";
import FooterPopUp from "@/components/global/FooterPopUp/FooterPopUp";
import { useAuth } from "@/providers/AuthProvider";
import { notifyError } from "@/lib/notifications";
import { useRouter } from "next/navigation";

const APK_PATH = "/GraphON-App.apk";

const quickFacts = [
  { label: "Размер", value: "10 МБ" },
  { label: "Совместимость", value: "Android 8.0 +" },
];

const installGuide = [
  "Нажмите кнопку «Скачать приложение» и подтвердите загрузку файла.",
  "Android предупредит о неизвестном источнике — это стандартно. Выберите «Всё равно скачать».",
  "После загрузки откройте APK, выберите «Разрешить установку» и дождитесь завершения.",
  "Готово! Откройте GraphON и находите мероприятия без ограничений.",
];

export default function DownloadAppPage() {
  const [isGuideOpen, setGuideOpen] = useState(false);
  const { theme } = useTheme();
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  return (
    <main className={styles.page} data-theme={theme ?? undefined}>
      <div className={styles.content}>
        <section className={styles.heroCard}>
          <div className={styles.heroAccent} />
          <div className={styles.heroInner}>
            <div className={styles.heroBody}>
              <div className={styles.heroHeader}>
                <h1 className={styles.title}>GraphON Mobile - лучшее приложение для поиска мероприятий</h1>
                <p className={styles.subtitle}>
                  Подписывайтесь на любимые графы, следи за мероприятиями и держи расписание в одном месте.
                </p>
              </div>
              <div className={styles.actions}>
                {isLoggedIn ? (
                  <Link href={APK_PATH} className={styles.downloadButton} prefetch={false} download>
                    <Download size={18} />
                    Скачать APK
                  </Link>
                ) : (
                  <button
                    type="button"
                    className={styles.downloadButton}
                    onClick={() => {
                      notifyError("Скачивание доступно только авторизованным пользователям");
                      router.push("/signIn");
                    }}
                  >
                    <Download size={18} />
                    Скачать APK
                  </button>
                )}
              </div>
              <div className={styles.quickFacts}>
                {quickFacts.map((fact) => (
                  <div key={fact.label} className={styles.fact}>
                    <div className={styles.factLabel}>{fact.label}</div>
                    <div className={styles.factValue}>{fact.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.heroMedia}>
              <div className={styles.heroMediaFrame}>
                <Image
                  src="/noImage.png"
                  alt="Предпросмотр GraphON Mobile"
                  fill
                  sizes="(max-width: 768px) 60vw, 320px"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <div className={styles.guideCTA}>
          <div className={styles.guideCTAInner}>
            <div>
              <p className={styles.guideHint}>Инструкция займёт меньше минуты</p>
              <h3 className={styles.guideCTAHeading}>Не уверены как установить приложение?</h3>
            </div>
            <button className={styles.guideButton} onClick={() => setGuideOpen(true)}>
              <Shield size={18} />
              Как установить?
            </button>
          </div>
        </div>
      </div>

      <FooterPopUp
        isOpen={isGuideOpen}
        onClose={() => setGuideOpen(false)}
        title="Как установить GraphON"
        maxHeight="80vh"
      >
        <div className={styles.themeScope} data-theme={theme ?? undefined}>
          <ol className={styles.guideList}>
            {installGuide.map((step, index) => (
              <li key={index} className={styles.guideItem}>
                <p className={styles.guideText}>{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </FooterPopUp>
    </main>
  );
}

