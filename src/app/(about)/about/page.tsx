'use client';

import { motion } from 'framer-motion';
import styles from './page.module.scss';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const AboutPage = () => {
    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <motion.section 
                className={styles.hero}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    GraphON - твой внеучебный гид
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    Инновационная платформа для организации и управления внеучебной деятельностью
                </motion.p>
            </motion.section>

            {/* Problem Section */}
            <motion.section 
                className={styles.section}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    Проблематика
                </motion.h2>
                <motion.div 
                    className={styles.problems}
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {[
                        {
                            title: "Усложнение каналов продвижения",
                            description: "Множество разрозненных источников информации создают хаос в коммуникации"
                        },
                        {
                            title: "Отсутствие централизованной системы оповещения",
                            description: "Важные события и мероприятия часто остаются незамеченными"
                        },
                        {
                            title: "Перегруженность информацией",
                            description: "Студенты теряются в потоке новостей и объявлений"
                        },
                        {
                            title: "Нецелевой график аудитории",
                            description: "Сложности с планированием и посещением мероприятий"
                        }
                    ].map((problem, index) => (
                        <motion.div 
                            key={index}
                            className={styles.problemCard}
                            variants={fadeIn}
                        >
                            <h3>{problem.title}</h3>
                            <p>{problem.description}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            {/* Features Section */}
            <motion.section 
                className={styles.section}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    Основные особенности и преимущества
                </motion.h2>
                <motion.div 
                    className={styles.features}
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {[
                        {
                            title: "B2C",
                            features: [
                                "Вся необходимая информация в одном месте",
                                "Удобный и эффективный способ поиска единомышленников",
                                "Создание личного расписания"
                            ]
                        },
                        {
                            title: "B2B",
                            features: [
                                "Дешёвая реклама в сравнении с директом",
                                "Увеличение продаж путём повышения вовлеченности",
                                "Таргетированная целевая аудитория"
                            ]
                        },
                        {
                            title: "B2G",
                            features: [
                                "Предоставление ответов на опросы для вузовских грантов",
                                "Доступ к аналите каждого объединения",
                                "Автоматическая генерация отчётов по объединениям"
                            ]
                        }
                    ].map((feature, index) => (
                        <motion.div 
                            key={index}
                            className={styles.featureBlock}
                            variants={fadeIn}
                        >
                            <h3>{feature.title}</h3>
                            <ul>
                                {feature.features.map((item, i) => (
                                    <motion.li
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.1 * i }}
                                    >
                                        {item}
                                    </motion.li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            {/* How It Works Section */}
            <motion.section 
                className={styles.section}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    Принцип работы
                </motion.h2>
                <motion.div 
                    className={styles.workflow}
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {[
                        "Заполняем существующие объединения ВУЗА в базу данных",
                        "Администрация ВУЗА заполняет мероприятия для каждого объединения",
                        "Предоставляем визуализированные данные о внеучебных мероприятиях",
                        "Предлагаем подписаться на мероприятия и уведомляем пользователей"
                    ].map((step, index) => (
                        <motion.div 
                            key={index}
                            className={styles.step}
                            variants={fadeIn}
                        >
                            <motion.div 
                                className={styles.stepNumber}
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ 
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 0.1 * index
                                }}
                            >
                                {index + 1}
                            </motion.div>
                            <p>{step}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>

            {/* Roadmap Section */}
            <motion.section 
                className={styles.section}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
            >
                <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    Конкурентные шаги
                </motion.h2>
                <motion.div 
                    className={styles.roadmap}
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {[
                        { date: "Август 2025", title: "Запуск для абитуриентов КГТУ" },
                        { date: "Октябрь 2025", title: "Поиск партнёров" },
                        { date: "Декабрь 2025", title: "Публикация коммерческих предложений" },
                        { date: "Февраль 2026", title: "Разработка виджета расписания" },
                        { date: "Апрель 2026", title: "Интеграция ИИ для графов" }
                    ].map((item, index) => (
                        <motion.div 
                            key={index}
                            className={styles.roadmapItem}
                            variants={fadeIn}
                        >
                            <motion.div 
                                className={styles.date}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * index }}
                            >
                                {item.date}
                            </motion.div>
                            <motion.div 
                                className={styles.content}
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <h3>{item.title}</h3>
                            </motion.div>
                        </motion.div>
                    ))}
                </motion.div>
            </motion.section>
        </div>
    );
};

export default AboutPage; 