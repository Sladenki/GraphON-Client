'use client'

import UploadForm from '@/components/ui/UploadForm/UploadForm';
import { GraphService } from '@/services/graph.service';
import { PostService } from '@/services/post.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import styles from './createPage.module.scss'
import { SpinnerLoader } from '@/components/ui/SpinnerLoader/SpinnerLoader';
import SelectGraph from './SelectGraph/SelectGraph';
import ButtonActive from '@/components/ui/ButtonActive/ButtonActive';
import { WarningText } from '@/components/ui/WarningText/WarningText';


const EmojiPicker = React.lazy(() => import('./EmojiPicker/EmojiPicker'));

const CreatePost = () => {
    const { push } = useRouter();

    const [content, setContent] = useState('');
    const [imgPath, setImgPath] = useState<File | null>(null);
    const [emoji, setEmoji] = useState(''); // Поле для эмодзи
    const [text, setText] = useState('');   // Поле для текста
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Показать или скрыть выбор эмодзи
    const [isLoading, setIsLoading] = useState(false); // Создание поста

    const [selectedGraph, setSelectedGraph] = useState('');

    // Получение главных графов
    const { isPending, isError, data: mainTopics, error } = useQuery({
        queryKey: ['graph/getParentGraphs'],
        queryFn: () => GraphService.getParentGraphs(),
    });

    if (isPending) return <SpinnerLoader/>;
    if (isError) return <p>Ошибка: {error.message}</p>;

    const handleImageChange = (file: File) => setImgPath(file);

    const handleSubmit = async () => {
        if (isLoading) return;

        // Проверяем, заполнены ли поля
        if (!content.trim() || !selectedGraph) {
            alert("Пожалуйста, заполните текст поста и выберите тему.");
            return; // Останавливаем выполнение
        }

        setIsLoading(true);

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
        formData.append('selectedGraph', selectedGraph._id); 

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
        } finally {
            setIsLoading(false); // Возвращаем кнопку в активное состояние
        }
    };

    // Функция для выбора эмодзи
    const handleEmojiClick = (selectedEmoji: string) => {
        setEmoji(selectedEmoji); // Устанавливаем выбранную эмодзи в поле ввода
        setShowEmojiPicker(false); // Закрываем меню выбора эмодзи
    };

  return (
    <div className={styles.createPostWrapper}>
        {/* Показываем пока не выбрали граф */}
        {!selectedGraph && (
            <span className={styles.warningText}>
                ⚠️ Пожалуйста, выберите граф для создания поста или мероприятия
            </span>
        )}

        {/* Поиск по графам + Создание нового графа + Список доступных графов */}
        {mainTopics && (
            <SelectGraph
                mainTopics={mainTopics.data}
                selectedGraph={selectedGraph}
                setSelectedGraph={setSelectedGraph}
            />
        )}

        {/* Показываем всю инфу только после выбора графа */}
        {selectedGraph && (
            <>
                <textarea
                    id="textField"
                    className={styles.textarea}
                    placeholder="Введите текст поста..."
                    maxLength={500}
                    onChange={(e) => setContent(e.target.value)}
                    value={content}
                />
                <span className={styles.countLetters}>Количество символов поста: {content.length} / 500</span>

                <UploadForm handleImageChange={handleImageChange} />

                <div className={styles.emojiContainer}>
                    <div className={styles.reactionContainer}>
                        <input
                            type="text"
                            maxLength={1}
                            placeholder="👍"
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

                    <span className={styles.countLetters}>Количество символов реакции: {text.length} / 10</span>

                </div>

                <div className={styles.buttonSubmit}>
                    <ButtonActive
                        text="Создать пост"
                        onClick={handleSubmit}
                        isLoading={isLoading}
                    />
                </div>

  
            </>
        )}

      
    </div>
  );
};

export default CreatePost;


