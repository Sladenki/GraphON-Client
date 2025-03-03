import { useState } from 'react';
import styles from './UploadForm.module.scss'

export default function UploadForm({ handleImageChange }: any) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      handleImageChange(selectedFile);
    }
  };

  return (
    <div className={styles.uploadWrapper}>
      <label htmlFor="fileInput" className={styles.uploadLabel}>
        {file ? "Выбран файл: " + file.name : "Загрузите изображение"}
      </label>
      <input
        id="fileInput"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className={styles.uploadInput}
      />
    </div>
  );
}


