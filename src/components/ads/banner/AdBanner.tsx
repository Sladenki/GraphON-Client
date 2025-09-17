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
    const [copied, setCopied] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        onClose?.();
    };

    const rootClass = useMemo(() => [styles.bannerRoot, className].filter(Boolean).join(' '), [className]);

    const handleCopyEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(email);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = email;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (_) {
            // no-op
        }
    };

    return (
        <div className={rootClass}>
            <div className={styles.content}>
                <div className={styles.badge}>✨ Вакансия</div>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.subtitle}>{subtitle}</p>
                <div className={styles.chips}>
                    <span className={styles.chip}>Без опыта</span>
                    <span className={styles.chip}>Креатив</span>
                    <span className={styles.chip}>SMM</span>
                </div>
                <div className={styles.actions}>
                    <button className={styles.ctaButton} onClick={handleOpen}>{ctaText}</button>
                    <button type="button" className={styles.contactButton} onClick={handleCopyEmail} aria-label="Скопировать email">
                        {copied ? '✅ Скопировано' : '📧 Email'}
                    </button>
                    <a className={styles.tgContactButton} href={`https://t.me/${tg.replace('@','')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>✈️ Telegram</a>
                </div>
            </div>
            <div className={styles.glow} aria-hidden="true" />

            <PopUpWrapper isOpen={open} onClose={handleClose} width={"min(680px, 92vw)"}>
                <div className={styles.modalHeader}>
                    <h3>Добринское фермерское хозяйство</h3>
                </div>
                <div className={styles.modalBody}>
                    <p className={styles.lead}><strong>Нужен энергичный, креативный и амбициозный человек для работы с соцсетями.</strong></p>
                    <p className={styles.note}>Не нужен опыт — всему научим! Главное — желание учиться, быстро схватывать новое и быть в теме трендов. Активность, инициативность и креатив — твои главные суперсилы.</p>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Что предстоит делать</h4>
                        <ul className={styles.list}>
                            <li>Вести соцсети: контент, посты, сторис, рилсы</li>
                            <li>Работать с аудиторией: комментарии, общение, вовлечение</li>
                            <li>Искать и предлагать новые идеи для продвижения</li>
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>Мы предлагаем</h4>
                        <ul className={styles.list}>
                            <li>Опыт и практику с нуля</li>
                            <li>Работу в крупной стабильной компании</li>
                            <li>Рост и развитие в SMM</li>
                        </ul>
                    </div>

                    <div className={styles.contacts}>
                        <button type="button" className={styles.mailButton} onClick={handleCopyEmail} aria-label="Скопировать email">
                            {copied ? '✅ Скопировано' : `Скопировать ${email}`}
                        </button>
                        <a className={styles.tgButton} href={`https://t.me/${tg.replace('@','')}`} target="_blank" rel="noreferrer">Написать в Telegram {tg}</a>
                    </div>
                    {/* Кнопку закрытия убрали по запросу */}
                </div>
            </PopUpWrapper>
        </div>
    );
};

export default AdBanner;

