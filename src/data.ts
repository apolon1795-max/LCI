import { Subject, Branch, Teacher } from './types';

export const SUBJECTS: Subject[] = [
    { id: 'math', name: 'Математика', emoji: '📐' },
    { id: 'russian', name: 'Русский язык', emoji: '📖' },
    { id: 'english', name: 'Английский', emoji: '🇬🇧' },
    { id: 'physics', name: 'Физика', emoji: '⚛️' },
    { id: 'chemistry', name: 'Химия', emoji: '🧪' },
    { id: 'it', name: 'Информатика', emoji: '💻' },
];

export const ASSESSMENTS = [
    { id: 'bad', title: 'Ребёнок не понимает тему', description: 'Тяжело даются базовые понятия и правила', emoji: '🤯' },
    { id: 'behind', title: 'Отстает от программы', description: 'Есть пробелы после пропусков или нужно подтянуть оценки', emoji: '📉' },
    { id: 'exam', title: 'Нужна подготовка к экзаменам', description: 'Целенаправленная подготовка к ОГЭ/ЕГЭ или ВПР', emoji: '🎯' },
    { id: 'good', title: 'Хочет знать больше', description: 'Интересуется предметом, готов к олимпиадам', emoji: '🚀' }
];

export const GRADES = [
    '1 класс', '2 класс', '3 класс', '4 класс',
    '5 класс', '6 класс', '7 класс', '8 класс',
    '9 класс (ОГЭ)', '10 класс', '11 класс (ЕГЭ)'
];

export const BRANCHES: Branch[] = [
    { id: 'center', name: 'Филиал Центр', address: 'ул. Пушкинская, 268', coordinates: [56.849925, 53.214041] },
    { id: 'metallurg', name: 'Филиал Металлург', address: 'ул. 50 лет ВЛКСМ, 36', coordinates: [56.868744, 53.179375] },
    { id: 'azino', name: 'Филиал Азино', address: 'ул. Ленина, 101', coordinates: [56.839843, 53.242784] }
];

export const TEACHERS: Teacher[] = [
    {
        id: 't1',
        name: 'Анна Сергеевна',
        subjects: ['math', 'physics'],
        branches: ['center', 'metallurg'],
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=800',
        description: 'Эксперт ЕГЭ по математике и физике. 98% учеников сдают на 85+ баллов.',
        quote: '«Сложное становится простым, если найти правильный подход к ученику!»'
    },
    {
        id: 't2',
        name: 'Мария Владимировна',
        subjects: ['russian', 'english'],
        branches: ['center', 'azino'],
        photoUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=600&h=800',
        description: 'Опыт работы 10+ лет. Уникальная методика запоминания правил и слов без зубрежки.',
        quote: '«Язык — это живой инструмент общения, а не просто набор скучных правил.»'
    },
    {
        id: 't3',
        name: 'Дмитрий Иванович',
        subjects: ['it', 'math'],
        branches: ['metallurg', 'azino'],
        photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=600&h=800',
        description: 'Готовит к олимпиадам по программированию. Практикующий IT-специалист.',
        quote: '«Мы не просто пишем код, мы учимся мыслить алгоритмически.»'
    },
    {
        id: 't4',
        name: 'Екатерина Дмитриевна',
        subjects: ['chemistry', 'physics'],
        branches: ['center'],
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=800',
        description: 'Член предметной комиссии. Поможет полюбить химию через наглядные примеры.',
        quote: '«Химия вокруг нас! И изучать её безумно интересно.»'
    }
];
