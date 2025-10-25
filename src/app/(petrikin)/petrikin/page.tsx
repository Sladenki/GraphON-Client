"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import styles from "./page.module.scss";
import { inter } from "@/app/fonts";
import coding from "../photos/coding.jpg";
import work from "../photos/work.jpg";
import hakaton from "../photos/hakaton.jpg";
import zGen from "../photos/Z.jpg";
import dele from "../photos/Dele.jpg";
import rosMol from "../photos/rosMol.jpg";
import battlSrc from "../photos/battl.jpg";


const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

function useAnimatedSum(increments: number[]) {
  const totalTarget = useMemo(() => increments.reduce((a, b) => a + b, 0), [increments]);
  const raw = useMotionValue(0);
  const eased = useSpring(raw, { stiffness: 90, damping: 20, mass: 0.6 });
  const formatted = useTransform(eased, (v) =>
    new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(v)
  );

  const add = (value: number) => {
    const current = raw.get();
    raw.set(current + value);
  };

  const reset = () => raw.set(0);

  return { formatted, add, reset, totalTarget } as const;
}

function AwardTrigger({ amount, onVisible, children }: { amount: number; onVisible: (v: number) => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { margin: "-20% 0px -20% 0px", once: true });
  useEffect(() => { if (inView) onVisible(amount); }, [inView, amount, onVisible]);
  return (
    <div ref={ref}>
      {children}
    </div>
  );
}

function SumBar({ label = "Итоговая сумма", sticky = false, children }: { label?: string; sticky?: boolean; children: React.ReactNode }) {
  return (
    <div className={sticky ? styles.sumSticky : styles.sumInline}>
      <span className={styles.sumLabel}>{label}</span>
      {children}
    </div>
  );
}

export default function PetrikinPage() {
  // amounts matching spec:
  const increments = [15000, 0, 66321, 1_000_000, 350_000];
  const { formatted, add } = useAnimatedSum(increments);

  return (
    <main className={`${styles.page} ${inter.variable}`}>
      {/* 1 — Приветствие */}
      <section className={styles.hero}>
        <motion.h1
          className={styles.heroText}
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Здравствуйте, Виктор Анатольевич
        </motion.h1>
      </section>

      <div className={styles.container}>
        {/* 2 — О себе */}
        <section className={styles.section}>
          <motion.div
            className={styles.split}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div variants={fadeInUp} className={styles.imageWrap}>
              <Image src={coding} alt="Coding" placeholder="blur" style={{ width: "100%", height: "auto" }} priority />
            </motion.div>
            <motion.div variants={fadeInUp} className={styles.text}>
              <div className={styles.heading}>О себе</div>
              Меня зовут Сахар Марк. Впервые я познакомился с программированием в 2018г. Активно начал изучать веб-программированием в 2020г.
            </motion.div>
          </motion.div>
        </section>

        {/* 3 — Опыт работы */}
        <section className={styles.section}>
          <motion.div
            className={`${styles.split} ${styles.reverse}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div variants={fadeInUp} className={styles.text}>
              <div className={styles.heading}>Опыт работы</div>
              С сентября 2024г работаю в компании ООО "Альфа" — Frontend React разработчиком. Мы занимаемся разработкой CRM систем для малых бизнесов.
            </motion.div>
            <motion.div variants={fadeInUp} className={styles.imageWrap}>
              <Image src={work} alt="Work" placeholder="blur" style={{ width: "100%", height: "auto" }} />
            </motion.div>
          </motion.div>
        </section>

        {/* 4 — Хакатон */}
        <section className={styles.section}>
          <motion.div
            className={styles.split}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <motion.div variants={fadeInUp} className={styles.imageWrap}>
              <Image src={hakaton} alt="Хакатон" placeholder="blur" style={{ width: "100%", height: "auto" }} />
            </motion.div>
            <motion.div variants={fadeInUp} className={styles.text}>
              <div className={styles.heading}>Хакатон</div>
              В феврале 2025г мы с одногруппниками — Сысоёв Артём и Кристина Крисько заняли первое место в вузовском хакатоне.
              {" "}
              <Link href="#" className={styles.link}>Ссылка на пост в Telegram</Link>
            </motion.div>
          </motion.div>
        </section>

        {/* 5 — Стартап GraphON (большой блок) */}
        <section className={styles.section}>
          <motion.div
            className={styles.bigBlock}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.heading}>Стартап GraphON</div>
            <p className={styles.text}>
              На данный момент я занимаюсь развитием своего стартапа. Проект называется GraphON — это платформа, которая помогает студентам КГТУ находить и участвовать во внеучебных мероприятиях с помощью визуализации в системе графов.
            </p>
            <SumBar sticky>
              <motion.span className={styles.sumValue}>{formatted}</motion.span>
            </SumBar>
          </motion.div>
        </section>

        {/* 6 — Generation Z (+15 000) */}
        <AwardTrigger amount={15000} onVisible={add}>
          <section className={`${styles.section} ${styles.award}`}>
            <motion.div
              className={styles.split}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div variants={fadeInUp} className={styles.imageWrap}>
                <Image src={zGen} alt="Generation Z" placeholder="blur" style={{ width: "100%", height: "auto" }} />
              </motion.div>
              <motion.div variants={fadeInUp} className={styles.text}>
                <div className={styles.heading}>Generation Z</div>
                В декабре 2024г вместе с Кристиной Крисько, мы заняли 3 место в поколении Z с проектом GraphON.
                {" "}
                <Link href="#" className={styles.link}>Ссылка</Link>
              </motion.div>
            </motion.div>
          </section>
        </AwardTrigger>
        <SumBar>
          <motion.span className={styles.sumValue}>{formatted}</motion.span>
        </SumBar>

        {/* 7 — Я в деле (+0) */}
        <AwardTrigger amount={0} onVisible={add}>
          <section className={styles.section}>
            <motion.div
              className={styles.split}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div variants={fadeInUp} className={styles.imageWrap}>
                <Image src={dele} alt="Я в деле" placeholder="blur" style={{ width: "100%", height: "auto" }} />
              </motion.div>
              <motion.div variants={fadeInUp} className={styles.text}>
                <div className={styles.heading}>Я в деле</div>
                В мае 2025г мы с командой заняли 1 место в Предпринимательском курсе в рамках обучения программы развития молодёжного предпринимательства «Я в деле». После чего, мы отправились в Москву на федеральный уровень.
              </motion.div>
            </motion.div>
          </section>
        </AwardTrigger>

        {/* 8 — РосМолодёжь (+66 321) */}
        <AwardTrigger amount={66321} onVisible={add}>
          <section className={`${styles.section} ${styles.award}`}>
            <motion.div
              className={styles.split}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ staggerChildren: 0.1 }}
            >
              <motion.div variants={fadeInUp} className={styles.imageWrap}>
                <Image src={rosMol} alt="РосМолодёжь.Гранты" placeholder="blur" style={{ width: "100%", height: "auto" }} />
              </motion.div>
              <motion.div variants={fadeInUp} className={styles.text}>
                <div className={styles.heading}>РосМолодёжь</div>
                В июне 2025г я выиграл РосМолодёжь.Гранты, где получил 66 000₽ на разработку GraphON.
              </motion.div>
            </motion.div>
          </section>
        </AwardTrigger>
        <SumBar>
          <motion.span className={styles.sumValue}>{formatted}</motion.span>
        </SumBar>

        {/* 9 — Студенческий стартап (+1 000 000) */}
        <AwardTrigger amount={1_000_000} onVisible={add}>
          <section className={`${styles.section} ${styles.award}`}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className={styles.text}
            >
              <motion.div variants={fadeInUp}>
                <div className={styles.heading}>Студенческий стартап</div>
                В сентябре 2025г я выиграл программу «Студенческий стартап», где получил 1 000 000₽ на разработку GraphON.
              </motion.div>
            </motion.div>
          </section>
        </AwardTrigger>
        <SumBar>
          <motion.span className={styles.sumValue}>{formatted}</motion.span>
        </SumBar>

        {/* 10 — БизнесБаттл (+350 000) */}
        <AwardTrigger amount={350_000} onVisible={add}>
          <section className={`${styles.section} ${styles.award}`}>
            <motion.div
              className={styles.split}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div variants={fadeInUp} className={styles.text}>
                <div className={styles.heading}>БизнесБаттл</div>
                В сентябре 2025г с командой выиграли «БизнесБаттл 7 сезона», где получили 350 000₽ на рекламу в западной медиа-прессе.
              </motion.div>
              <motion.div variants={fadeInUp} className={styles.imageWrap}>
                <Image src={battlSrc} alt="БизнесБаттл" width={1200} height={800} style={{ width: "100%", height: "auto" }} />
              </motion.div>
            </motion.div>
          </section>
        </AwardTrigger>
        <SumBar>
          <motion.span className={styles.sumValue}>{formatted}</motion.span>
        </SumBar>

        {/* Завершение — действия */}
        <section className={styles.section}>
          <motion.div
            className={styles.bigBlock}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <p className={styles.text}>Вы можете перейти по ссылкам ниже и посмотреть, о чём проект.</p>
            <div className={styles.actions}>
              <Link href="/events" className={styles.btn}>Мероприятия</Link>
              <Link href="/graphs" className={`${styles.btn} ${styles.secondary}`}>Граф визуализаций</Link>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  );
}

