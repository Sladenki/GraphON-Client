"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useEffect, useRef } from "react";
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

function AwardTrigger({ onVisible, children }: { onVisible?: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { margin: "-20% 0px -20% 0px", once: true });
  useEffect(() => { if (inView && onVisible) onVisible(); }, [inView, onVisible]);
  return (
    <div ref={ref}>
      {children}
    </div>
  );
}

export default function PetrikinPage() {
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

        {/* 5 — Стартап GraphON (большой блок, текст во всю ширину) */}
        <section className={styles.section}>
          <motion.div
            className={styles.bigBlock}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
          >
            <div className={`${styles.heading} ${styles.bigTitle}`}>Стартап GraphON</div>
            <p className={styles.textWide}>
              На данный момент я занимаюсь развитием своего стартапа. Проект называется GraphON — это платформа, которая помогает студентам КГТУ находить и участвовать во внеучебных мероприятиях с помощью визуализации в системе графов.
            </p>
          </motion.div>
        </section>

        {/* 6 — Generation Z (+15 000) */}
        <AwardTrigger>
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
                <div className={styles.heading}>Поколение Z</div>
                В декабре 2024г вместе с Кристиной Крисько, мы заняли 3 место в поколении Z с проектом GraphON.
                {" "}
                <Link href="#" className={styles.link}>Ссылка</Link>
                <div className={styles.sumDelta}><span className={styles.sumDeltaValue}>+15 000 ₽</span></div>
              </motion.div>
            </motion.div>
          </section>
        </AwardTrigger>

        {/* 7 — Я в деле (+0) */}
        <AwardTrigger>
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
        <AwardTrigger>
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
                <div className={styles.sumDelta}><span className={styles.sumDeltaValue}>+66 321 ₽</span></div>
              </motion.div>
            </motion.div>
          </section>
        </AwardTrigger>

        {/* 9 — Студенческий стартап (+1 000 000) */}
        <AwardTrigger>
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
                <div className={styles.sumDelta}><span className={styles.sumDeltaValue}>+1 000 000 ₽</span></div>
              </motion.div>
            </motion.div>
          </section>
        </AwardTrigger>

        {/* 10 — БизнесБаттл (+350 000) */}
        <AwardTrigger>
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
                <div className={styles.sumDelta}><span className={styles.sumDeltaValue}>+350 000 ₽</span></div>
              </motion.div>
              <motion.div variants={fadeInUp} className={styles.imageWrap}>
                <Image src={battlSrc} alt="БизнесБаттл" width={1200} height={800} style={{ width: "100%", height: "auto" }} />
              </motion.div>
            </motion.div>
          </section>
        </AwardTrigger>

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

