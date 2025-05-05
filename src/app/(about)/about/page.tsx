'use client';

import { motion } from 'framer-motion';
import styles from './page.module.scss';
import Link from 'next/link';

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
                    GraphON - Ваш путь к успеху
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    Инновационная платформа, которая трансформирует внеучебную деятельность в мощный инструмент для развития и достижения целей
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
                    Проблемы, которые мы решаем
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
                            title: "Информационный хаос",
                            description: "Множество разрозненных источников информации создают путаницу и приводят к пропуску важных возможностей"
                        },
                        {
                            title: "Потеря важных событий",
                            description: "Без централизованной системы оповещения студенты часто пропускают значимые мероприятия и возможности для развития"
                        },
                        {
                            title: "Информационная перегрузка",
                            description: "Студенты тонут в потоке новостей и объявлений, теряя время на фильтрацию информации"
                        },
                        {
                            title: "Неэффективное планирование",
                            description: "Сложности с организацией времени и посещением мероприятий из-за отсутствия удобного инструмента планирования"
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
                    Преимущества для каждого
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
                            title: "Для студентов",
                            features: [
                                "Единая платформа для всех внеучебных активностей",
                                "Умная система рекомендаций мероприятий",
                                "Персональное расписание с уведомлениями",
                                "Возможность найти единомышленников"
                            ]
                        },
                        {
                            title: "Для организаций",
                            features: [
                                "Эффективное продвижение мероприятий",
                                "Точное попадание в целевую аудиторию",
                                "Аналитика и статистика посещаемости",
                                "Автоматизация организационных процессов"
                            ]
                        },
                        {
                            title: "Для учебных заведений",
                            features: [
                                "Централизованное управление внеучебной деятельностью",
                                "Автоматическая генерация отчетности",
                                "Мониторинг активности студентов",
                                "Интеграция с существующими системами"
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
                    Как это работает
                </motion.h2>
                <motion.div 
                    className={styles.workflow}
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                >
                    {[
                        "Создаем базу данных объединений и мероприятий",
                        "Организаторы публикуют информацию о событиях",
                        "Студенты получают персонализированные рекомендации",
                        "Умная система напоминает о важных мероприятиях"
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
                    Наши планы развития
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
                        { date: "Октябрь 2025", title: "Расширение партнерской сети" },
                        { date: "Декабрь 2025", title: "Внедрение системы рекомендаций" },
                        { date: "Февраль 2026", title: "Запуск мобильного приложения" },
                        { date: "Апрель 2026", title: "Интеграция ИИ для персонализации" }
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

            {/* CTA Section */}
            <motion.section 
                className={styles.ctaSection}
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
                    Готовы начать?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    Присоединяйтесь к GraphON сегодня и откройте для себя новые возможности для развития и роста
                </motion.p>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    <Link href="/" className={styles.ctaButton}>
                        Начать бесплатно
                    </Link>
                </motion.div>
            </motion.section>
        </div>
    );
};

export default AboutPage; 