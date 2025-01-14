'use client'

import UploadForm from '@/components/ui/UploadForm/UploadForm';
import { GraphService } from '@/services/graph.service';
import { PostService } from '@/services/post.service';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'
import SelectTopics from './SelectTopics/SelectTopics';
import EmojiPicker from './EmojiPicker/EmojiPicker';

const CreatePost = () => {
    const [content, setContent] = useState('');
    const [imgPath, setImgPath] = useState<File | null>(null);
    const [emoji, setEmoji] = useState(''); // Поле для эмодзи
    const [text, setText] = useState('');   // Поле для текста
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Показать или скрыть выбор эмодзи
    const { push } = useRouter();

    const [selectedTopic, setSelectedTopic] = useState('');

    // console.log('selectedTopic', selectedTopic)

    const [childrenTopic, setChildrenTopic] = useState('')

    // Получение главных графов
    const { isPending, isError, data: mainTopics, error } = useQuery({
        queryKey: ['graph/getParentGraphs'],
        queryFn: () => GraphService.getParentGraphs(),
    });

    if (isPending) return <p>Загрузка...</p>;
    if (isError) return <p>Ошибка: {error.message}</p>;

    // console.log('mainTopics', mainTopics.data)

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
        formData.append('childrenTopic', childrenTopic); 

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
      <div>

        {mainTopics && 
            <SelectTopics 
                mainTopics={mainTopics.data} 
                selectedTopic={selectedTopic}
                setSelectedTopic={setSelectedTopic}
            />
        }

        <textarea 
            id="textField"
            placeholder="Введите текст поста"
            maxLength={800}
            onChange={(e) => setContent(e.target.value)}
            value={content} 
        />

        <input 
            type="text"
            maxLength={10} 
            placeholder="Подтематика"
            value={childrenTopic}
            onChange={(e) => setChildrenTopic(e.target.value)}
        />

        <UploadForm handleImageChange={handleImageChange} />

        <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px', position: 'relative' }}>
            <input 
                type="text"
                maxLength={1} // Максимум один символ для эмодзи
                placeholder="Эмодзи"
                value={emoji}
                onFocus={() => setShowEmojiPicker(true)} // Открываем меню при фокусе
                onChange={(e) => setEmoji(e.target.value)}
                style={{ width: '50px', marginRight: '10px' }} // Ширина поля эмодзи
            />

            {/* Меню выбора эмодзи */}
            {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}

            <input 
                type="text"
                maxLength={10} // Максимум 10 символов для текста
                placeholder="Текст реакции"
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ flex: 1 }} // Поле текста занимает оставшееся пространство
            />
        </div>

        <button onClick={handleSubmit}>Create Post</button>
      </div>
  );
};

export default CreatePost;


