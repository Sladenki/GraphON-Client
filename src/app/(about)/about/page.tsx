'use client';

import { motion } from 'framer-motion';
import styles from './page.module.scss';

const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const AboutPage = () => {
    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <motion.section 
                className={styles.hero}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                <h1>GraphON - твой внеучебный гид</h1>
                <p>Инновационная платформа для организации и управления внеучебной деятельностью</p>
            </motion.section>

            {/* Problem Section */}
            <motion.section 
                className={styles.section}
                {...fadeIn}
            >
                <h2>Проблематика</h2>
                <div className={styles.problems}>
                    <div className={styles.problemCard}>
                        <h3>Усложнение каналов продвижения</h3>
                        <p>Множество разрозненных источников информации создают хаос в коммуникации</p>
                    </div>
                    <div className={styles.problemCard}>
                        <h3>Отсутствие централизованной системы оповещения</h3>
                        <p>Важные события и мероприятия часто остаются незамеченными</p>
                    </div>
                    <div className={styles.problemCard}>
                        <h3>Перегруженность информацией</h3>
                        <p>Студенты теряются в потоке новостей и объявлений</p>
                    </div>
                    <div className={styles.problemCard}>
                        <h3>Нецелевой график аудитории</h3>
                        <p>Сложности с планированием и посещением мероприятий</p>
                    </div>
                </div>
            </motion.section>

            {/* Features Section */}
            <motion.section 
                className={styles.section}
                {...fadeIn}
            >
                <h2>Основные особенности и преимущества</h2>
                <div className={styles.features}>
                    <div className={styles.featureBlock}>
                        <h3>B2C</h3>
                        <ul>
                            <li>Вся необходимая информация в одном месте</li>
                            <li>Удобный и эффективный способ поиска единомышленников</li>
                            <li>Создание личного расписания</li>
                        </ul>
                    </div>
                    <div className={styles.featureBlock}>
                        <h3>B2B</h3>
                        <ul>
                            <li>Дешёвая реклама в сравнении с директом</li>
                            <li>Увеличение продаж путём повышения вовлеченности</li>
                            <li>Таргетированная целевая аудитория</li>
                        </ul>
                    </div>
                    <div className={styles.featureBlock}>
                        <h3>B2G</h3>
                        <ul>
                            <li>Предоставление ответов на опросы для вузовских грантов</li>
                            <li>Доступ к аналите каждого объединения</li>
                            <li>Автоматическая генерация отчётов по объединениям</li>
                        </ul>
                    </div>
                </div>
            </motion.section>

            {/* How It Works Section */}
            <motion.section 
                className={styles.section}
                {...fadeIn}
            >
                <h2>Принцип работы</h2>
                <div className={styles.workflow}>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>1</div>
                        <p>Заполняем существующие объединения ВУЗА в базу данных</p>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>2</div>
                        <p>Администрация ВУЗА заполняет мероприятия для каждого объединения</p>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>3</div>
                        <p>Предоставляем визуализированные данные о внеучебных мероприятиях</p>
                    </div>
                    <div className={styles.step}>
                        <div className={styles.stepNumber}>4</div>
                        <p>Предлагаем подписаться на мероприятия и уведомляем пользователей</p>
                    </div>
                </div>
            </motion.section>

            {/* Roadmap Section */}
            <motion.section 
                className={styles.section}
                {...fadeIn}
            >
                <h2>Конкурентные шаги</h2>
                <div className={styles.roadmap}>
                    <div className={styles.roadmapItem}>
                        <div className={styles.date}>Август 2025</div>
                        <div className={styles.content}>
                            <h3>Запуск для абитуриентов КГТУ</h3>
                        </div>
                    </div>
                    <div className={styles.roadmapItem}>
                        <div className={styles.date}>Октябрь 2025</div>
                        <div className={styles.content}>
                            <h3>Поиск партнёров</h3>
                        </div>
                    </div>
                    <div className={styles.roadmapItem}>
                        <div className={styles.date}>Декабрь 2025</div>
                        <div className={styles.content}>
                            <h3>Публикация коммерческих предложений</h3>
                        </div>
                    </div>
                    <div className={styles.roadmapItem}>
                        <div className={styles.date}>Февраль 2026</div>
                        <div className={styles.content}>
                            <h3>Разработка виджета расписания</h3>
                        </div>
                    </div>
                    <div className={styles.roadmapItem}>
                        <div className={styles.date}>Апрель 2026</div>
                        <div className={styles.content}>
                            <h3>Интеграция ИИ для графов</h3>
                        </div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default AboutPage; 