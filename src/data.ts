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
    { id: 'behind', title: 'Отстаёт от программы', description: 'Есть пробелы после пропусков или нужно подтянуть оценки', emoji: '📉' },
    { id: 'exam', title: 'Нужна подготовка к экзаменам', description: 'Целенаправленная подготовка к ОГЭ/ЕГЭ или ВПР', emoji: '🎯' },
    { id: 'good', title: 'Хочет знать больше', description: 'Интересуется предметом, готов к олимпиадам', emoji: '🚀' }
];

export const getAssessmentsForGrade = (grade: string | null) => {
    const gradeNumber = Number.parseInt(grade?.match(/\d+/)?.[0] || '1', 10);
    return ASSESSMENTS.map((assessment) => {
        if (assessment.id === 'exam' && gradeNumber < 9) {
            return {
                ...assessment,
                title: 'Подготовка к ВПР и олимпиадам',
                description: 'Целенаправленная подготовка к контрольным работам и школьным олимпиадам',
                emoji: '🏆',
            };
        }
        return assessment;
    });
};

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
        photoUrl: '/teachers/demo-1.jpg',
        description: 'Пример карточки преподавателя. Предметы, филиалы, опыт и достижения будут подтверждены LCI после съёмки.',
        quote: '«Здесь появится короткая видеовизитка и обращение преподавателя к ученику.»',
        isDemo: true,
    },
    {
        id: 't2',
        name: 'Мария Владимировна',
        subjects: ALL_SUBJECTS,
        branches: ALL_BRANCHES,
        photoUrl: '/teachers/demo-2.jpg',
        description: 'Пример карточки преподавателя. Фактическое описание будет добавлено после интервью и согласования с LCI.',
        quote: '«Здесь преподаватель расскажет, кому подойдёт его подход и как проходят занятия.»',
        isDemo: true,
    },
    {
        id: 't3',
        name: 'Дмитрий Иванович',
        subjects: ALL_SUBJECTS,
        branches: ALL_BRANCHES,
        photoUrl: '/teachers/demo-3.jpg',
        description: 'Пример карточки преподавателя. Факты о подготовке к экзаменам и олимпиадам пока не заявляются.',
        quote: '«Здесь появится видеорассказ о занятиях, целях учеников и формате обратной связи.»',
        isDemo: true,
    },
    {
        id: 't4',
        name: 'Екатерина Дмитриевна',
        subjects: ALL_SUBJECTS,
        branches: ALL_BRANCHES,
        photoUrl: '/teachers/demo-4.jpg',
        description: 'Пример карточки преподавателя. Реальные предметы и расписание будут загружены из материалов LCI.',
        quote: '«Здесь преподаватель объяснит свой подход и пригласит на пробное занятие.»',
        isDemo: true,
    },
    {
        id: 't5',
        name: 'Светлана Юрьевна',
        subjects: ALL_SUBJECTS,
        branches: ALL_BRANCHES,
        photoUrl: '/teachers/demo-5.jpg',
        description: 'Пример карточки преподавателя. Подтверждённые квалификация и опыт появятся после съёмки.',
        quote: '«Здесь будет короткое знакомство, чтобы ребёнок мог сделать осознанный выбор.»',
        isDemo: true,
    }
];
