// Ждем полной загрузки DOM, чтобы убедиться, что все скрипты WordPress и WooCommerce уже инициализированы
document.addEventListener('DOMContentLoaded', () => { 

    // Самовызывающаяся функция для изоляции области видимости переменных и организации кода
    (function () {
        // Получаем функцию createElement из объекта wp.element (React-обертка WordPress)
        // createElement нужен для создания React-элементов программно
        const { createElement } = wp.element;
    
        // Логируем объект wp.element для отладки — смотрим, что он загружен и доступен
        console.log('wp.element:', wp.element);
        // Проверяем, что в wp.element есть функция createElement — это простой способ проверить, что React доступен
        console.log('Is React:', !!(wp.element && wp.element.createElement));
    
        // Проверяем, что глобальный объект window.wc и его поле wcBlocksRegistry доступны
        // И что в нем есть функция registerPaymentMethod — это функция WooCommerce Blocks для регистрации нового метода оплаты
        if (
            !window.wc || // Проверяем, что wc существует
            !window.wc.wcBlocksRegistry || // Проверяем, что есть wcBlocksRegistry
            typeof window.wc.wcBlocksRegistry.registerPaymentMethod !== 'function' // Проверяем, что registerPaymentMethod — функция
        ) {
            // Если что-то не так — выводим ошибку и прерываем регистрацию
            console.error('WooCommerce Blocks registerPaymentMethod not available.');
            return;
        }
    
        // Получаем функцию registerPaymentMethod из wcBlocksRegistry
        const { registerPaymentMethod } = window.wc.wcBlocksRegistry;
    
        // Объявляем объект нового метода оплаты
        const ProxyStripePaymentMethod = {
            name: 'proxystripe', // Уникальное имя метода, используемое WooCommerce
            label: createElement(
                'span',
                null,
                'ProxyStripe',
                createElement('img', {
                    src: '/wp-content/plugins/proxy-stripe/img/cards.png',
                    alt: '',
                    style: { width: '76px', padding: '11px', verticalAlign: 'middle' }
                }),
            ), // Название метода, отображаемое пользователю в интерфейсе выбора оплаты
            canMakePayment: () => true, // Функция, которая говорит, доступен ли этот метод 
            ariaLabel: 'Оплата через Uniform', // Для доступности — озвучивает название метода для экранных читалок
    
            // React-элемент, который будет отображаться как содержимое описания метода оплаты
            content: createElement('div', null, 'Оплатите через ProxyStripe'),

            // React-элемент, который будет отображаться в редакторе (если используется)
            edit: createElement('div', null, 'Оплатите через ProxyStripe'),

            // Дополнительные настройки — какие фичи поддерживает метод оплаты
            supports: {
                features: ['products'] // Например, поддержка оплаты продуктов
            }
        };
    
        // Регистрируем новый метод оплаты в WooCommerce Blocks
        registerPaymentMethod(ProxyStripePaymentMethod);

        // Логируем успешную регистрацию для отладки
        console.log('ProxyStripe method registered');
    })();
})