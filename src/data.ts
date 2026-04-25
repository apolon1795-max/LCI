import { Subject, Branch, Teacher } from './types';

export const SUBJECTS: Subject[] = [
    { id: 'math', name: 'Математика', emoji: '📐', minGrade: 1 },
    { id: 'russian', name: 'Русский язык', emoji: '📖', minGrade: 1 },
    { id: 'english', name: 'Английский', emoji: '🇬🇧', minGrade: 1 },
    { id: 'physics', name: 'Физика', emoji: '⚛️', minGrade: 7 },
    { id: 'chemistry', name: 'Химия', emoji: '🧪', minGrade: 8 },
    { id: 'it', name: 'Информатика', emoji: '💻', minGrade: 5 },
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
    { id: 'pushkinskaya', name: 'Филиал на Пушкинской', address: 'ул. Пушкинская, 198', coordinates: [56.845421, 53.210515], schedule: 'Пн-Пт: 09:00-21:00\nСб: 09:00-19:00\nВс: выходной', phone: '+7(912) 750-23-04', email: 'admin@lci-izh.ru' },
    { id: 'kungurtseva', name: 'Филиал на Кунгурцева', address: 'ул. Кунгурцева, 4', coordinates: [56.883398, 53.243575], schedule: 'Пн-Пт: 09:00-19:00\nСб-Вс: выходной', phone: '+7(912) 750-23-04' },
    { id: 'bersha', name: 'Филиал на Берша', address: 'ул. Архитектора П.П. Берша, 4', coordinates: [56.856943, 53.288219], schedule: 'Пн-Пт: 09:00-19:00\nСб: 09:00-17:00\nВс: выходной', phone: '+7(912) 750-23-04' },
    { id: 'vlksm', name: 'Филиал на 50 лет ВЛКСМ', address: 'ул. 50 лет ВЛКСМ, 2', coordinates: [56.866579, 53.181829], schedule: 'Пн-Пт: 09:00-21:00\nСб: 09:00-17:00\nВс: выходной', phone: '+7(919) 916-90-66', email: 'admin@lci-izh.ru' }
];

const ALL_SUBJECTS = ['math', 'russian', 'english', 'physics', 'chemistry', 'it'];
const ALL_BRANCHES = ['pushkinskaya', 'kungurtseva', 'bersha', 'vlksm'];

export const TEACHERS: Teacher[] = [
    {
        id: 't1',
        name: 'Анна Сергеевна',
        subjects: ALL_SUBJECTS,
        branches: ALL_BRANCHES,
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600&h=800',
        description: 'Эксперт ЕГЭ. 98% учеников сдают на 85+ баллов.',
        quote: '«Сложное становится простым, если найти правильный подход к ученику!»'
    },
    {
        id: 't2',
        name: 'Мария Владимировна',
        subjects: ALL_SUBJECTS,
        branches: ALL_BRANCHES,
        photoUrl: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&q=80&w=600&h=800',
        description: 'Опыт работы 10+ лет. Уникальная методика без зубрежки.',
        quote: '«Учеба — это живой процесс общения, а не просто набор скучных правил.»'
    },
    {
        id: 't3',
        name: 'Дмитрий Иванович',
        subjects: ALL_SUBJECTS,
        branches: ALL_BRANCHES,
        photoUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=600&h=800',
        description: 'Готовит к олимпиадам. Практикующий специалист.',
        quote: '«Мы не просто решаем задачи, мы учимся мыслить системно.»'
    },
    {
        id: 't4',
        name: 'Екатерина Дмитриевна',
        subjects: ALL_SUBJECTS,
        branches: ALL_BRANCHES,
        photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600&h=800',
        description: 'Член предметной комиссии. Поможет полюбить свой предмет.',
        quote: '«Наука вокруг нас! И изучать её безумно интересно.»'
    },
    {
        id: 't5',
        name: 'Светлана Юрьевна',
        subjects: ALL_SUBJECTS,
        branches: ALL_BRANCHES,
        photoUrl: 'https://images.unsplash.com/photo-1594824436951-7f12bc58d551?auto=format&fit=crop&q=80&w=600&h=800',
        description: 'Педагог высшей категории. Успешно готовит 1-11 классы.',
        quote: '«Каждый ребенок талантлив, нужно лишь помочь ему это узнать.»'
    }
];
