import { useEffect, useRef } from 'react';

export const useScrollLock = (isLocked: boolean) => {
  const scrollPositionRef = useRef(0);
  const stylesRef = useRef<{
    bodyOverflow: string;
    bodyPosition: string;
    bodyTop: string;
    bodyLeft: string;
    bodyRight: string;
    bodyWidth: string;
    bodyPaddingRight: string;
    htmlPaddingRight: string;
    htmlScrollbarGutter: string;
  } | null>(null);

  useEffect(() => {
    if (!isLocked) {
      // Восстанавливаем стили при разблокировке
      if (stylesRef.current) {
        const {
          bodyOverflow,
          bodyPosition,
          bodyTop,
          bodyLeft,
          bodyRight,
          bodyWidth,
          bodyPaddingRight,
          htmlPaddingRight,
          htmlScrollbarGutter,
        } = stylesRef.current;

        // Восстанавливаем все стили
        document.body.style.overflow = bodyOverflow;
        document.body.style.position = bodyPosition;
        document.body.style.top = bodyTop;
        document.body.style.left = bodyLeft;
        document.body.style.right = bodyRight;
        document.body.style.width = bodyWidth;
        document.body.style.paddingRight = bodyPaddingRight;
        document.documentElement.style.paddingRight = htmlPaddingRight;
        if ('scrollbarGutter' in document.documentElement.style) {
          document.documentElement.style.scrollbarGutter = htmlScrollbarGutter;
        }

        // Восстанавливаем позицию скролла
        window.scrollTo(0, scrollPositionRef.current);

        stylesRef.current = null;
      }
      return;
    }

    const body = document.body;
    const html = document.documentElement;

    // Сохраняем текущую позицию скролла
    scrollPositionRef.current = window.scrollY;

    // Сохраняем оригинальные стили
    const originalBodyOverflow = body.style.overflow || '';
    const originalBodyPosition = body.style.position || '';
    const originalBodyTop = body.style.top || '';
    const originalBodyLeft = body.style.left || '';
    const originalBodyRight = body.style.right || '';
    const originalBodyWidth = body.style.width || '';
    const originalBodyPaddingRight = body.style.paddingRight || '';
    const originalHtmlPaddingRight = html.style.paddingRight || '';
    const originalHtmlScrollbarGutter = html.style.scrollbarGutter || '';

    stylesRef.current = {
      bodyOverflow: originalBodyOverflow,
      bodyPosition: originalBodyPosition,
      bodyTop: originalBodyTop,
      bodyLeft: originalBodyLeft,
      bodyRight: originalBodyRight,
      bodyWidth: originalBodyWidth,
      bodyPaddingRight: originalBodyPaddingRight,
      htmlPaddingRight: originalHtmlPaddingRight,
      htmlScrollbarGutter: originalHtmlScrollbarGutter,
    };

    // Используем scrollbar-gutter: stable для резервирования места под скроллбар
    // Это предотвращает сдвиг контента при скрытии скроллбара
    // Если свойство не поддерживается, оно просто игнорируется
    if ('scrollbarGutter' in html.style) {
      html.style.scrollbarGutter = 'stable';
    } else {
      // Fallback для старых браузеров - используем padding-right
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        body.style.paddingRight = `${scrollbarWidth}px`;
        (html.style as CSSStyleDeclaration).paddingRight = `${scrollbarWidth}px`;
      }
    }

    // Фиксируем позицию через position: fixed
    // Это полностью предотвращает любое движение контента
    body.style.position = 'fixed';
    body.style.top = `-${scrollPositionRef.current}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    // Cleanup
    return () => {
      if (stylesRef.current) {
        const {
          bodyOverflow,
          bodyPosition,
          bodyTop,
          bodyLeft,
          bodyRight,
          bodyWidth,
          bodyPaddingRight,
          htmlPaddingRight,
          htmlScrollbarGutter,
        } = stylesRef.current;

        // Восстанавливаем все стили
        body.style.overflow = bodyOverflow;
        body.style.position = bodyPosition;
        body.style.top = bodyTop;
        body.style.left = bodyLeft;
        body.style.right = bodyRight;
        body.style.width = bodyWidth;
        body.style.paddingRight = bodyPaddingRight;
        html.style.paddingRight = htmlPaddingRight;
        if ('scrollbarGutter' in html.style) {
          html.style.scrollbarGutter = htmlScrollbarGutter;
        }

        // Восстанавливаем позицию скролла
        window.scrollTo(0, scrollPositionRef.current);

        stylesRef.current = null;
      }
    };
  }, [isLocked]);
};

