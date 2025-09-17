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

const AD_BANNER_COPY = {
    badge: '✨ Вакансия',
    title: 'SMM-специалист — начни с нами!',
    subtitle: 'Крупное фермерское хозяйство ищет энергичного человека для соцсетей',
    chips: ['Без опыта', 'Креатив', 'SMM'],
    employerName: 'Добринское фермерское хозяйство',
    lead: 'Нужен энергичный, креативный и амбициозный человек для работы с соцсетями.',
    note: 'Не нужен опыт — всему научим! Главное — желание учиться, быстро схватывать новое и быть в теме трендов. Активность, инициативность и креатив — твои главные суперсилы.',
    whatToDoTitle: 'Что предстоит делать',
    whatToDoList: [
        'Вести соцсети: контент, посты, сторис, рилсы',
        'Работать с аудиторией: комментарии, общение, вовлечение',
        'Искать и предлагать новые идеи для продвижения',
    ],
    weOfferTitle: 'Мы предлагаем',
    weOfferList: [
        'Опыт и практику с нуля',
        'Работу в крупной стабильной компании',
        'Рост и развитие в SMM',
    ],
    defaultEmail: 'marketing@dobrinskoe.com',
    defaultTg: '@dobrinskoe_fh',
} as const;


export const AdBanner: React.FC<AdBannerProps> = ({
    title = AD_BANNER_COPY.title,
    subtitle = AD_BANNER_COPY.subtitle,
    email = AD_BANNER_COPY.defaultEmail,
    tg = AD_BANNER_COPY.defaultTg,
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
                <div className={styles.badge}>{AD_BANNER_COPY.badge}</div>
                <h3 className={styles.title}>{title}</h3>
                <p className={styles.subtitle}>{subtitle}</p>
                <div className={styles.chips}>
                    {AD_BANNER_COPY.chips.map((chip) => (
                        <span key={chip} className={styles.chip}>{chip}</span>
                    ))}
                </div>
                <div className={styles.actions}>
                    <button className={styles.ctaButton} onClick={handleOpen}>Узнать подробнее</button>
                    <button type="button" className={styles.contactButton} onClick={handleCopyEmail} aria-label="Скопировать email">
                        {copied ? '✅ Скопировано' : '📧 Email'}
                    </button>
                    <a className={styles.tgContactButton} href={`https://t.me/${tg.replace('@','')}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>✈️ Telegram</a>
                </div>
            </div>
            <div className={styles.glow} aria-hidden="true" />

            <PopUpWrapper isOpen={open} onClose={handleClose} width={"min(680px, 92vw)"}>
                <div className={styles.modalHeader}>
                    <h3>{AD_BANNER_COPY.employerName}</h3>
                </div>
                <div className={styles.modalBody}>
                    <p className={styles.lead}><strong>{AD_BANNER_COPY.lead}</strong></p>
                    <p className={styles.note}>{AD_BANNER_COPY.note}</p>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>{AD_BANNER_COPY.whatToDoTitle}</h4>
                        <ul className={styles.list}>
                            {AD_BANNER_COPY.whatToDoList.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.section}>
                        <h4 className={styles.sectionTitle}>{AD_BANNER_COPY.weOfferTitle}</h4>
                        <ul className={styles.list}>
                            {AD_BANNER_COPY.weOfferList.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>

                    <div className={styles.contacts}>
                        <button type="button" className={styles.mailButton} onClick={handleCopyEmail} aria-label="Скопировать email">
                            {copied ? '✅ Скопировано' : `Скопировать ${email}`}
                        </button>
                        <a className={styles.tgButton} href={`https://t.me/${tg.replace('@','')}`} target="_blank" rel="noreferrer">Написать в Telegram {tg}</a>
                    </div>
                </div>
            </PopUpWrapper>
        </div>
    );
};

export default AdBanner;

