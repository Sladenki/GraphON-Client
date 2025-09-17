"use client";

import React, { useState, useMemo } from 'react';
import PopUpWrapper from '@/components/global/PopUpWrapper/PopUpWrapper';
import styles from './AdBanner.module.scss';

export interface AdBannerProps {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    email?: string;
    tg?: string;
    onClose?: () => void;
    className?: string;
}

const DEFAULT_TITLE = 'SMM-специалист — начни с нами!';
const DEFAULT_SUBTITLE = 'Крупное фермерское хозяйство ищет энергичного человека для соцсетей';
const DEFAULT_CTA = 'Узнать подробнее';

export const AdBanner: React.FC<AdBannerProps> = ({
    title = DEFAULT_TITLE,
    subtitle = DEFAULT_SUBTITLE,
    ctaText = DEFAULT_CTA,
    email = 'marketing@dobrinskoe.com',
    tg = '@dobrinskoe_fh',
    onClose,
    className
}) => {
    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        onClose?.();
    };

    const rootClass = useMemo(() => [styles.bannerRoot, className].filter(Boolean).join(' '), [className]);

    return (
        <div className={rootClass}>
            <div className={styles.content}>
                <div className={styles.badge}>Вакансия</div>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.subtitle}>{subtitle}</p>
                <div className={styles.actions}>
                    <button className={styles.ctaButton} onClick={handleOpen}>{ctaText}</button>
                    <a className={styles.link} href={`mailto:${email}`} onClick={(e) => e.stopPropagation()}>{email}</a>
                    <a className={styles.link} href={`https://t.me/${tg.replace('@','')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>{tg}</a>
                </div>
            </div>

            <PopUpWrapper isOpen={open} onClose={handleClose} width={"min(640px, 92vw)"}>
                <div className={styles.modalHeader}>
                    <h3>Добринское фермерское хозяйство</h3>
                </div>
                <div className={styles.modalBody}>
                    <p><strong>Нужен энергичный, креативный и амбициозный человек для работы с соцсетями.</strong></p>
                    <p>Не нужен опыт — всему научим! Главное — желание учиться, быстро схватывать новое и быть в теме трендов. Активность, инициативность и креатив — твои главные суперсилы.</p>
                    <p><strong>Что предстоит делать:</strong></p>
                    <ul>
                        <li>Вести соцсети: контент, посты, сторис, рилсы</li>
                        <li>Работать с аудиторией: комментарии, общение, вовлечение</li>
                        <li>Искать и предлагать новые идеи для продвижения</li>
                    </ul>
                    <p><strong>Мы предлагаем:</strong></p>
                    <ul>
                        <li>Опыт и практику с нуля</li>
                        <li>Работу в крупной стабильной компании</li>
                        <li>Рост и развитие в SMM</li>
                    </ul>
                    <div className={styles.contacts}>
                        <a className={styles.mailButton} href={`mailto:${email}`}>Написать на {email}</a>
                        <a className={styles.tgButton} href={`https://t.me/${tg.replace('@','')}`} target="_blank" rel="noreferrer">Написать в Telegram {tg}</a>
                    </div>
                    <div className={styles.modalFooter}>
                        <button className={styles.secondaryButton} onClick={handleClose}>Закрыть</button>
                    </div>
                </div>
            </PopUpWrapper>
        </div>
    );
};

export default AdBanner;

