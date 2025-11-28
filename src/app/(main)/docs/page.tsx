'use client'

import { useState } from 'react';
import { FileText, Download, Shield, Cookie, Lock, FileCheck, FileSignature } from 'lucide-react';
import styles from './page.module.scss';
import ButtonBack from '@/components/global/ButtonBack/ButtonBack';

interface Document {
  id: string;
  title: string;
  description: string;
  filePath: string;
  icon: React.ReactNode;
  color: string;
}

const documents: Document[] = [
  {
    id: 'cookie',
    title: 'Политика использования cookie файлов',
    description: 'Документ определяет порядок использования файлов cookie на сайте, типы используемых cookie, цели их использования и права пользователей в отношении cookie.',
    filePath: '/docs/Политика использования cooki файлов.docx',
    icon: <Cookie size={24} />,
    color: '#8b5cf6'
  },
  {
    id: 'pd-protection',
    title: 'Положение о защите персональных данных',
    description: 'Документ устанавливает порядок обработки, хранения и защиты персональных данных пользователей в соответствии с требованиями Федерального закона № 152-ФЗ «О персональных данных».',
    filePath: '/docs/Положение о защите ПД.docx',
    icon: <Shield size={24} />,
    color: '#22c55e'
  },
  {
    id: 'pd-work',
    title: 'Положение по работе с персональными данными',
    description: 'Документ регламентирует внутренние процедуры работы с персональными данными, права и обязанности оператора, меры по обеспечению безопасности персональных данных.',
    filePath: '/docs/Положение по работе с ПД.docx',
    icon: <Lock size={24} />,
    color: '#3b82f6'
  },
  {
    id: 'pd-consent',
    title: 'Согласие на обработку персональных данных',
    description: 'Документ содержит форму согласия пользователя на обработку его персональных данных оператором в соответствии с требованиями Федерального закона № 152-ФЗ «О персональных данных».',
    filePath: '/docs/Согласие на обработку ПД.docx',
    icon: <FileSignature size={24} />,
    color: '#f59e0b'
  }
];

export default function DocsPage() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = (doc: Document) => {
    setDownloading(doc.id);
    
    // Создаем ссылку для скачивания
    const link = document.createElement('a');
    link.href = doc.filePath;
    link.download = doc.filePath.split('/').pop() || '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => {
      setDownloading(null);
    }, 500);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <FileCheck size={32} />
          </div>
          <h1 className={styles.title}>Юридические документы</h1>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.intro}>
          <p className={styles.introText}>
            Настоящие документы разработаны в соответствии с требованиями законодательства Российской Федерации 
            и обеспечивают правовую защиту оператора персональных данных и пользователей сайта.
          </p>
          <div className={styles.legalInfo}>
            <p><strong>Оператор персональных данных:</strong> GraphON</p>
            <p><strong>Юридическая база:</strong> Федеральный закон № 152-ФЗ «О персональных данных»</p>
          </div>
        </div>

        <div className={styles.documentsGrid}>
          {documents.map((doc) => (
            <div key={doc.id} className={styles.documentCard}>
              <div className={styles.documentHeader}>
                <div 
                  className={styles.documentIcon}
                  style={{ backgroundColor: `${doc.color}20`, color: doc.color }}
                >
                  {doc.icon}
                </div>
                <h2 className={styles.documentTitle}>{doc.title}</h2>
              </div>
              
              <p className={styles.documentDescription}>{doc.description}</p>
              
              <button
                className={styles.downloadButton}
                onClick={() => handleDownload(doc)}
                disabled={downloading === doc.id}
                style={{ 
                  backgroundColor: doc.color,
                  '--hover-color': doc.color
                } as React.CSSProperties}
              >
                {downloading === doc.id ? (
                  <>
                    <div className={styles.spinner} />
                    <span>Загрузка...</span>
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    <span>Скачать документ</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <div className={styles.footerContent}>
            <h3 className={styles.footerTitle}>Важная информация</h3>
            <ul className={styles.footerList}>
              <li>
                Все документы соответствуют требованиям действующего законодательства Российской Федерации
              </li>
              <li>
                Документы могут быть изменены в случае изменения законодательства или политики сайта
              </li>
              <li>
                Пользователи уведомляются об изменениях через уведомления на сайте
              </li>
              <li>
                При возникновении вопросов обращайтесь к администрации сайта по электронной почте: <a href="mailto:graph_on@mail.ru" className={styles.emailLink}>graph_on@mail.ru</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

