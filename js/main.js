/**
 * Основной скрипт веб-сайта ФОЦ "Виталь"
 * Управление DOM, мобильное меню, валидация формы,
 * загрузка данных специалистов из XML через DOM
 */

(function() {
    'use strict';

    // ============================================
    // 1. Мобильное меню (бургер)
    // ============================================
    const burgerBtn = document.getElementById('burgerBtn');
    const mainNav = document.getElementById('mainNav');

    if (burgerBtn && mainNav) {
        burgerBtn.addEventListener('click', function() {
            mainNav.classList.toggle('open');
            const isOpen = mainNav.classList.contains('open');
            burgerBtn.setAttribute('aria-expanded', isOpen);
        });
    }

    // ---------- Закрытие меню при клике на ссылку ----------
    const navLinks = document.querySelectorAll('.header__nav a');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function() {
            if (mainNav && mainNav.classList.contains('open')) {
                mainNav.classList.remove('open');
            }
        });
    });

    // ============================================
    // 2. Форма записи на приём
    // ============================================
    const appointmentForm = document.getElementById('appointmentForm');
    const successMessage = document.getElementById('successMessage');

    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Простая клиентская валидация
            const name = document.getElementById('name').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const direction = document.getElementById('direction').value;
            const date = document.getElementById('date').value;

            if (!name || !phone || !direction || !date) {
                alert('Пожалуйста, заполните все обязательные поля.');
                return;
            }

            // Скрываем форму, показываем сообщение об успехе
            appointmentForm.style.display = 'none';
            if (successMessage) {
                successMessage.style.display = 'block';
            }
        });
    }

    // ---------- Установка минимальной даты (завтра) ----------
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dateInput.min = tomorrow.toISOString().split('T')[0];
    }

    // ============================================
    // 3. Загрузка специалистов из XML через DOM
    // ============================================
    const specialistsGrid = document.getElementById('specialistsGrid');

    /**
     * Функция загрузки XML-данных специалистов
     * Использует XMLHttpRequest и DOM API для парсинга XML
     */
    function loadSpecialistsFromXML() {
        // Определяем путь к XML в зависимости от текущей страницы
        const xmlPath = window.location.pathname.includes('/pages/')
            ? '../data/specialists.xml'
            : './data/specialists.xml';

        const xhr = new XMLHttpRequest();
        xhr.open('GET', xmlPath, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || xhr.status === 0) {
                    try {
                        // Парсинг XML через DOMParser
                        const parser = new DOMParser();
                        const xmlDoc = parser.parseFromString(xhr.responseText, 'application/xml');

                        // Проверка на ошибки парсинга
                        const parseError = xmlDoc.querySelector('parsererror');
                        if (parseError) {
                            console.error('Ошибка парсинга XML:', parseError.textContent);
                            renderSpecialistsFallback();
                            return;
                        }

                        // Извлечение данных из XML DOM
                        const specialistNodes = xmlDoc.getElementsByTagName('specialist');
                        const specialists = [];

                        for (let i = 0; i < specialistNodes.length; i++) {
                            const node = specialistNodes[i];
                            specialists.push({
                                id: getXMLNodeText(node, 'id'),
                                name: getXMLNodeText(node, 'name'),
                                specialization: getXMLNodeText(node, 'specialization'),
                                photo: getXMLNodeText(node, 'photo'),
                                category: getXMLNodeText(node, 'category')
                            });
                        }

                        // Рендеринг специалистов в DOM
                        renderSpecialists(specialists);
                    } catch (error) {
                        console.error('Ошибка обработки XML:', error);
                        renderSpecialistsFallback();
                    }
                } else {
                    console.error('Ошибка загрузки XML:', xhr.statusText);
                    renderSpecialistsFallback();
                }
            }
        };
        xhr.send();
    }

    /**
     * Вспомогательная функция: получает текстовое содержимое дочернего элемента
     */
    function getXMLNodeText(parentNode, tagName) {
        const element = parentNode.getElementsByTagName(tagName)[0];
        return element ? element.textContent.trim() : '';
    }

    /**
     * Рендеринг специалистов в DOM
     * Создает элементы динамически через document.createElement
     */
    function renderSpecialists(specialists) {
        if (!specialistsGrid) return;

        // Очищаем контейнер
        specialistsGrid.innerHTML = '';

        specialists.forEach(function(spec) {
            // Создаем карточку специалиста через DOM API
            const card = document.createElement('div');
            card.className = 'specialists-page__card';
            card.setAttribute('data-id', spec.id);
            card.setAttribute('data-category', spec.category);

            // Фото
            const photoDiv = document.createElement('div');
            photoDiv.className = 'specialists-page__card-photo';
            const img = document.createElement('img');
            img.src = spec.photo;
            img.alt = spec.name;
            photoDiv.appendChild(img);

            // Информация
            const infoDiv = document.createElement('div');
            infoDiv.className = 'specialists-page__card-info';

            const nameDiv = document.createElement('div');
            nameDiv.className = 'specialists-page__card-name';
            nameDiv.textContent = spec.name;

            const roleDiv = document.createElement('div');
            roleDiv.className = 'specialists-page__card-role';
            roleDiv.textContent = spec.specialization;

            const catDiv = document.createElement('div');
            catDiv.className = 'specialists-page__card-category';
            catDiv.textContent = spec.category;

            infoDiv.appendChild(nameDiv);
            infoDiv.appendChild(roleDiv);
            infoDiv.appendChild(catDiv);

            card.appendChild(photoDiv);
            card.appendChild(infoDiv);

            specialistsGrid.appendChild(card);
        });
    }

    /**
     * Резервный вариант: статические данные если XML не загрузился
     */
    function renderSpecialistsFallback() {
        if (!specialistsGrid) return;

        const fallbackData = [
            { id: 1, name: 'Коляденко Дмитрий Олегович', specialization: 'Врач-травматолог-ортопед', photo: '../images/doctor1.jpg', category: 'Врач' },
            { id: 2, name: 'Маркарян Арсен Олегович', specialization: 'Врач спортивной медицины', photo: '../images/doctor2.jpg', category: 'Врач' },
            { id: 3, name: 'Крейс Юджин Владимирович', specialization: 'Врач-невролог', photo: '../images/doctor3.jpg', category: 'Врач' },
            { id: 4, name: 'Вульф Стивен Карлович', specialization: 'Врач-физиотерапевт', photo: '../images/doctor4.jpg', category: 'Врач' },
            { id: 5, name: 'Хаус Олег Семёнович', specialization: 'Врач-травматолог-ортопед', photo: '../images/doctor5.jpg', category: 'Врач' },
            { id: 6, name: 'Рональд Джереми Хайят', specialization: 'Врач-невролог', photo: '../images/doctor6.jpg', category: 'Врач' },
            { id: 7, name: 'Роко Олег Олегович', specialization: 'Врач-физиотерапевт', photo: '../images/doctor7.jpg', category: 'Врач' },
            { id: 8, name: 'Дедлайнов Пётр Горшкович', specialization: 'Инструктор ЛФК', photo: '../images/trainer1.jpg', category: 'Инструктор' },
            { id: 9, name: 'Нормисов Егор Какадович', specialization: 'Инструктор-методист физической реабилитации', photo: '../images/trainer2.jpg', category: 'Инструктор' },
            { id: 10, name: 'Дронов Ярослав Павлович', specialization: 'Групповой тренер по кроссфиту', photo: '../images/trainer3.jpg', category: 'Тренер' },
            { id: 11, name: 'Нейтральнов Шон Павлович', specialization: 'Врач спортивной медицины', photo: '../images/trainer4.jpg', category: 'Врач' },
            { id: 12, name: 'Назарбаев Егор Абдуллаев', specialization: 'Врач лечебной физкультуры', photo: '../images/trainer5.jpg', category: 'Врач' }
        ];

        renderSpecialists(fallbackData);
    }

    // Запускаем загрузку специалистов из XML
    if (specialistsGrid) {
        loadSpecialistsFromXML();
    }

})();