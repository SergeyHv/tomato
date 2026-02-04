
import { Tomato, TomatoColor, TomatoType, GrowthType, NewsItem } from './types';

export const TOMATO_DATA: Tomato[] = [
  {
    id: '1',
    name: 'Сержант Пеппер',
    originalName: 'Sergeant Pepper',
    description: 'Популярный сердцевидный биколор с антоциановыми плечиками.',
    fullDescription: 'Сержант Пеппер — потрясающий сорт, созданный Джейсоном Хейнсом. Плоды сердцевидной формы с фиолетовыми плечиками (антоциан), которые при созревании становятся розово-малиновыми. Вкус сладкий, сложный, "конфетный". Куст высокий, тонкого строения, очень урожайный.',
    color: TomatoColor.BiColor,
    type: TomatoType.Heart,
    growth: GrowthType.Indeterminate,
    height: '1.8м - 2.0м',
    weight: '150г - 300г',
    imageUrl: '/images/sergeant.jpg',
    price: 150
  },
  {
    id: '2',
    name: 'Чёрная Вишня',
    originalName: 'Black Cherry',
    description: 'Классические темные черри со сладким, пряным вкусом.',
    fullDescription: 'Один из самых вкусных сортов черри. Формирует огромные кисти круглых, тёмно-коричневых плодов. Вкус очень насыщенный, сладкий, с фруктовыми нотками. Идеален для свежего потребления прямо с куста.',
    color: TomatoColor.Black,
    type: TomatoType.Cherry,
    growth: GrowthType.Indeterminate,
    height: '2.0м+',
    weight: '20г - 30г',
    imageUrl: 'https://placehold.co/600x400/f1f5f9/0f172a?text=Чёрная+Вишня',
    price: 120
  },
  {
    id: '3',
    name: 'Банановые Ноги',
    originalName: 'Banana Legs',
    description: 'Жёлтые сосульки, невероятно урожайный сорт для засолки.',
    fullDescription: 'Детерминантный (низкий) куст, буквально увешанный ярко-жёлтыми вытянутыми плодами. Мякоть плотная, семян мало. Идеально подходят для цельноплодного консервирования — красиво смотрятся в банке.',
    color: TomatoColor.Yellow,
    type: TomatoType.Plum,
    growth: GrowthType.Determinate,
    height: '0.8м - 1.2м',
    weight: '80г - 100г',
    imageUrl: 'https://placehold.co/600x400/fefce8/ca8a04?text=Банановые+Ноги',
    price: 130
  },
  {
    id: '4',
    name: 'Бычье Сердце Красное',
    originalName: 'Bull\'s Heart Red',
    description: 'Старая добрая классика. Огромные, мясистые, сахаристые на разломе.',
    fullDescription: 'Классическое "бабушкино" Бычье Сердце. Плоды огромные, мясистые, почти без сока. Вкус — тот самый настоящий помидорный, сладкий с кислинкой. Требует хорошей подвязки из-за тяжести плодов.',
    color: TomatoColor.Red,
    type: TomatoType.Heart,
    growth: GrowthType.Indeterminate,
    height: '1.6м - 1.9м',
    weight: '300г - 800г',
    imageUrl: 'https://placehold.co/600x400/fef2f2/991b1b?text=Бычье+Сердце',
    price: 140
  },
  {
    id: '5',
    name: 'Гном Пурпурное Сердце',
    originalName: 'Dwarf Purple Heart',
    description: 'Компактный штамбовый куст для кашпо с крупными тёмными сердцами.',
    fullDescription: 'Уникальный сорт из проекта "Гном Томатный". Куст низкий, коренастый, с морщинистыми листьями. Можно выращивать в ведрах на балконе. Дает на удивление крупные фиолетовые плоды отличного вкуса.',
    color: TomatoColor.Black,
    type: TomatoType.Heart,
    growth: GrowthType.Dwarf,
    height: '0.6м - 1.0м',
    weight: '150г - 250г',
    imageUrl: 'https://placehold.co/600x400/f3e8ff/6b21a8?text=Гном+Пурпурное',
    price: 160
  }
];

export const NEWS_DATA: NewsItem[] = [
  {
    id: '1',
    title: 'Когда сажать рассаду?',
    date: '15.02.2024',
    summary: 'Оптимальное время для посева индетов — за 60 дней до высадки в грунт. Не спешите, переросшая рассада хуже приживается.'
  },
  {
    id: '2',
    title: 'Новинки сезона 2024',
    date: '10.02.2024',
    summary: 'Мы добавили в каталог 15 новых сортов, включая знаменитые "Минусинские" томаты.'
  },
  {
    id: '3',
    title: 'Как подготовить грунт',
    date: '28.01.2024',
    summary: 'Добавьте биогумус и разрыхлитель (перлит или вермикулит) для дыхания корней.'
  }
];
