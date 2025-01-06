export function time2TimeAgo(data: string) {

    if (data === 'now') {
        return 'сейчас'
    }

    const months = [
        'Января',
        'Февраля',
        'Марта',
        'Апреля',
        'Мая',
        'Июня',
        'Июля',
        'Августа',
        'Сентября',
        'Октрября',
        'Ноября',
        'Декабря',
    ];

    // День публикации
    const Day = new Date(data).getDate()

    // Месяц публикации
    const Month = months[new Date(data).getMonth()]

    // Время публикации
    let Time = new Date(data).getHours() + ':';

    if (new Date(data).getMinutes() < 10) {
        Time += '0';
    }

    Time += new Date(data).getMinutes();

    // Текущее время
    const currentDate = new Date();

    // Время публикации
    const initialDate = new Date(data);

    // Считаем разницу
    const seconds = Math.floor((currentDate.getTime() - initialDate.getTime()) / 1000);

  
    // Больше двух дней
    if (seconds > 2 * 24 * 3600) { 
        return Day + ' ' + Month + ' в ' + Time
    }

    if (seconds > 24 * 3600) {
        return `Вчера в ${Time}`
    }

    if (seconds > 3600) {
        return 'Пару часов назад'
    }

    if (seconds > 1800) {
        return 'Менее часа назад'
    }

    if (seconds > 60) {
        return Math.floor(seconds / 60) + ' минут назад'
    }

    if (seconds < 60) {
        return 'Меньше минуты назад'
    }


}