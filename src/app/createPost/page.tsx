'use client'

import UploadForm from '@/components/ui/UploadForm/UploadForm';
import { GraphService } from '@/services/graph.service';
import { PostService } from '@/services/post.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import SelectTopics from './SelectTopics/SelectTopics';
import EmojiPicker from './EmojiPicker/EmojiPicker';
import styles from './createPage.module.scss'
import { SpinnerLoader } from '@/components/ui/SpinnerLoader/SpinnerLoader';

const CreatePost = () => {
    const { push } = useRouter();

    const [content, setContent] = useState('');
    const [imgPath, setImgPath] = useState<File | null>(null);
    const [emoji, setEmoji] = useState(''); // Поле для эмодзи
    const [text, setText] = useState('');   // Поле для текста
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Показать или скрыть выбор эмодзи

    const [selectedTopic, setSelectedTopic] = useState('');

    // Получение главных графов
    const { isPending, isError, data: mainTopics, error } = useQuery({
        queryKey: ['graph/getParentGraphs'],
        queryFn: () => GraphService.getParentGraphs(),
    });

    if (isPending) return <SpinnerLoader/>;
    if (isError) return <p>Ошибка: {error.message}</p>;

    const handleImageChange = (file: File) => setImgPath(file);

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('content', content);
        if (imgPath) formData.append('imgPath', imgPath);

        // Создаем объект reaction и добавляем его в formData
        const reaction = {
            emoji,
            text,
        };

        formData.append('reaction', JSON.stringify(reaction)); // Преобразуем в строку
        // @ts-expect-error 123
        formData.append('selectedTopic', selectedTopic._id); 

        try {
            const response = await PostService.createPost(formData);

            if (response.status === 200) {
                push('/');
                setContent('');
                setImgPath(null);
                setEmoji('');
                setText('');
            }
        } catch (error) {
            console.error('Ошибка при создании поста:', error);
        }
    };

    // Функция для выбора эмодзи
    const handleEmojiClick = (selectedEmoji: string) => {
        setEmoji(selectedEmoji); // Устанавливаем выбранную эмодзи в поле ввода
        setShowEmojiPicker(false); // Закрываем меню выбора эмодзи
    };

  return (
    <div className={styles.createPostWrapper}>
        {/* Поиск по существующим графам + Создание нового графа + Список доступных графов */}
        {mainTopics && (
            <SelectTopics
                mainTopics={mainTopics.data}
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
            />
        )}

        <textarea
            id="textField"
            className={styles.textarea}
            placeholder="Введите текст поста..."
            maxLength={800}
            onChange={(e) => setContent(e.target.value)}
            value={content}
        />
        <span>Количество введенных символов: {content.length} / 800</span>

        <UploadForm handleImageChange={handleImageChange} />

        <div className={styles.emojiContainer}>
            <input
                type="text"
                maxLength={1}
                placeholder="😊"
                value={emoji}
                onFocus={() => setShowEmojiPicker(true)}
                onChange={(e) => setEmoji(e.target.value)}
                className={styles.emojiInput}
            />

            {showEmojiPicker && (
                <div className={styles.emojiPicker}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
            )}

            <input
                type="text"
                maxLength={10}
                placeholder="Текст реакции"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className={styles.reactionInput}
            />
        </div>

        <button className={styles.createButton} onClick={handleSubmit}>
            Создать пост
        </button>
    </div>
  );
};

export default CreatePost;


