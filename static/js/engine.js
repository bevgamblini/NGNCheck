// Базовый скрипт для страницы анализа двигателя

document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const analysisForm = document.getElementById('analysisForm');
    const resetFormBtn = document.getElementById('resetForm');
    const resultsPlaceholder = document.getElementById('resultsPlaceholder');
    const resultsContent = document.getElementById('resultsContent');
    const comparisonTable = document.getElementById('comparisonTable');
    const recommendationsContent = document.getElementById('recommendationsContent');
    const analysisDetails = document.getElementById('analysisDetails');
    const saveReportBtn = document.getElementById('saveReport');
    const printReportBtn = document.getElementById('printReport');
    const statusBadge = document.querySelector('.status-badge');
    const statusIndicator = document.querySelector('.status-indicator');
    const statusText = document.querySelector('.status-text');
    const detailedAnalysis = document.getElementById('detailedAnalysis');

    // Эталонные значения (будут заменены данными из блоков)
    const referenceValues = {
        current: 3.6,
        voltage: 380,
        vibration: 2.8,
        temperature: 70,
        isolation: 1.0
    };

    // Допустимые отклонения (%)
    const tolerances = {
        current: 10,      // ±10%
        voltage: 5,       // ±5%
        vibration: 20,    // ±20%
        temperature: 15,  // ±15%
        isolation: -30    // минимальный порог (-30% от номинала)
    };

    // Описания параметров
    const parameterNames = {
        current: 'Ток статора',
        voltage: 'Напряжение',
        vibration: 'Вибрация',
        temperature: 'Температура подшипника',
        isolation: 'Сопротивление изоляции'
    };

    // Единицы измерения
    const parameterUnits = {
        current: 'А',
        voltage: 'В',
        vibration: 'мм/с',
        temperature: '°C',
        isolation: 'МОм'
    };

    // База знаний по неисправностям
    const faultDatabase = {
        current_high: {
            title: "Повышенный ток статора",
            description: "Значение тока превышает номинальное на",
            causes: [
                "Механическая перегрузка двигателя",
                "Износ подшипников",
                "Повышенное трение в механизме",
                "Неисправность питающей сети"
            ],
            recommendations: [
                "Проверить нагрузку на валу двигателя",
                "Осмотреть подшипники на предмет износа",
                "Проверить центровку и соосность",
                "Измерить напряжение питающей сети"
            ]
        },
        current_low: {
            title: "Пониженный ток статора",
            description: "Значение тока ниже номинального на",
            causes: [
                "Недогрузка двигателя",
                "Проблемы с питающей сетью",
                "Неисправность контрольно-измерительных приборов"
            ],
            recommendations: [
                "Проверить работу приводимого механизма",
                "Убедиться в правильности измерений",
                "Проверить параметры питающей сети"
            ]
        },
        voltage_high: {
            title: "Повышенное напряжение",
            description: "Напряжение превышает номинальное на",
            causes: [
                "Нестабильность питающей сети",
                "Неправильная настройка трансформатора",
                "Сезонные колебания в сети"
            ],
            recommendations: [
                "Установить стабилизатор напряжения",
                "Проверить настройки питающего трансформатора",
                "Мониторить параметры сети в течение суток"
            ]
        },
        voltage_low: {
            title: "Пониженное напряжение",
            description: "Напряжение ниже номинального на",
            causes: [
                "Падение напряжения в сети",
                "Недостаточное сечение питающих кабелей",
                "Плохие контакты в силовой цепи"
            ],
            recommendations: [
                "Проверить сечение и длину питающих кабелей",
                "Осмотреть контакты и соединения",
                "Рассмотреть возможность установки автотрансформатора"
            ]
        },
        vibration_high: {
            title: "Повышенная вибрация",
            description: "Вибрация превышает допустимую на",
            causes: [
                "Дисбаланс ротора",
                "Износ подшипников",
                "Ослабление креплений",
                "Несоосность с приводимым механизмом"
            ],
            recommendations: [
                "Выполнить балансировку ротора",
                "Заменить изношенные подшипники",
                "Проверить и затянуть все крепления",
                "Проверить центровку с механизмом"
            ]
        },
        temperature_high: {
            title: "Перегрев подшипников",
            description: "Температура превышает допустимую на",
            causes: [
                "Недостаточная смазка",
                "Износ подшипников",
                "Чрезмерная предварительная нагрузка",
                "Попадание загрязнений"
            ],
            recommendations: [
                "Дозаправить или заменить смазку",
                "Заменить изношенные подшипники",
                "Проверить правильность монтажа",
                "Устранить источники загрязнения"
            ]
        },
        isolation_low: {
            title: "Снижение сопротивления изоляции",
            description: "Сопротивление изоляции ниже нормы на",
            causes: [
                "Попадание влаги в обмотки",
                "Старение изоляции",
                "Загрязнение обмоток",
                "Механические повреждения"
            ],
            recommendations: [
                "Выполнить сушку двигателя",
                "Произвести очистку обмоток",
                "Выполнить пропитку изоляции",
                "При необходимости перемотать двигатель"
            ]
        }
    };

    // Обработчик отправки формы
    analysisForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Собираем данные из формы
        const measuredValues = {
            current: parseFloat(document.getElementById('current').value),
            voltage: parseFloat(document.getElementById('voltage').value),
            vibration: parseFloat(document.getElementById('vibration').value),
            temperature: parseFloat(document.getElementById('temperature').value),
            isolation: parseFloat(document.getElementById('isolation').value)
        };

        // Выполняем анализ
        const analysisResults = analyzeParameters(measuredValues);
        
        // Отображаем результаты
        displayResults(analysisResults);
        
        // Прокручиваем к результатам
        resultsContent.scrollIntoView({ behavior: 'smooth' });
    });

    // Сброс формы
    resetFormBtn.addEventListener('click', function() {
        analysisForm.reset();
        resetAnalysis();
    });

    // Сохранение отчета
    saveReportBtn.addEventListener('click', function() {
        generateReport();
    });

    // Печать отчета
    printReportBtn.addEventListener('click', function() {
        window.print();
    });

    // Функция анализа параметров
    function analyzeParameters(measured) {
        const results = [];
        const deviations = [];
        const faults = [];
        
        Object.keys(measured).forEach(param => {
            const measuredValue = measured[param];
            const referenceValue = referenceValues[param];
            const tolerance = tolerances[param];
            
            // Расчет отклонения
            let deviation;
            if (param === 'isolation') {
                // Для изоляции считаем снижение
                deviation = ((measuredValue - referenceValue) / referenceValue) * 100;
            } else {
                deviation = ((measuredValue - referenceValue) / referenceValue) * 100;
            }
            
            // Определение типа отклонения
            let deviationType = 'normal';
            let faultType = null;
            
            if (param === 'isolation') {
                if (measuredValue < referenceValue) {
                    deviationType = 'error';
                    faultType = 'isolation_low';
                }
            } else {
                if (Math.abs(deviation) > Math.abs(tolerance)) {
                    deviationType = 'error';
                    if (param === 'current' && deviation > 0) faultType = 'current_high';
                    if (param === 'current' && deviation < 0) faultType = 'current_low';
                    if (param === 'voltage' && deviation > 0) faultType = 'voltage_high';
                    if (param === 'voltage' && deviation < 0) faultType = 'voltage_low';
                    if (param === 'vibration' && deviation > 0) faultType = 'vibration_high';
                    if (param === 'temperature' && deviation > 0) faultType = 'temperature_high';
                }
            }
            
            if (faultType) {
                faults.push({
                    type: faultType,
                    param: param,
                    deviation: deviation,
                    measured: measuredValue,
                    reference: referenceValue
                });
            }
            
            deviations.push({
                param: param,
                measured: measuredValue,
                reference: referenceValue,
                deviation: deviation,
                type: deviationType,
                faultType: faultType
            });
            
            results.push({
                name: parameterNames[param],
                reference: `${referenceValue} ${parameterUnits[param]}`,
                measured: `${measuredValue} ${parameterUnits[param]}`,
                deviation: `${deviation > 0 ? '+' : ''}${deviation.toFixed(1)}%`,
                hasError: deviationType === 'error'
            });
        });
        
        return {
            results: results,
            deviations: deviations,
            faults: faults,
            hasErrors: faults.length > 0,
            overallStatus: faults.length > 0 ? 'warning' : 'good'
        };
    }

    // Отображение результатов
    function displayResults(analysis) {
        // Скрываем заглушку и показываем контент
        resultsPlaceholder.style.display = 'none';
        resultsContent.style.display = 'flex';
        
        // Заполняем таблицу сравнения
        comparisonTable.innerHTML = '';
        analysis.results.forEach(result => {
            const row = document.createElement('div');
            row.className = `comparison-row ${result.hasError ? 'error' : ''}`;
            
            row.innerHTML = `
                <div class="param-name">${result.name}</div>
                <div class="nominal-value">${result.reference}</div>
                <div class="measured-value ${result.hasError ? 'error' : ''}">${result.measured}</div>
            `;
            
            comparisonTable.appendChild(row);
        });
        
        // Формируем рекомендации
        let recommendationsHTML = '';
        
        if (analysis.faults.length === 0) {
            recommendationsHTML = `
                <h4>✅ Все параметры в норме</h4>
                <p><strong>Общее состояние двигателя: отличное.</strong> Все измеренные параметры находятся в пределах допустимых отклонений от номинальных значений.</p>
                
                <h4>Рекомендации:</h4>
                <ol>
                    <li>Продолжить эксплуатацию в текущем режиме</li>
                    <li>Выполнять плановое техническое обслуживание согласно графику</li>
                    <li>Проводить периодический контроль параметров (не реже 1 раза в месяц)</li>
                    <li>Соблюдать условия эксплуатации, указанные в паспорте двигателя</li>
                </ol>
                
                <p><em>Следующую диагностику рекомендуется провести через 6 месяцев или при изменении условий эксплуатации.</em></p>
            `;
            
            // Скрываем детальный анализ, если нет отклонений
            detailedAnalysis.style.display = 'none';
        } else {
            recommendationsHTML = `
                <h4>⚠️ Обнаружены отклонения от номинальных значений</h4>
                <p><strong>Общее состояние двигателя: требует внимания.</strong> Обнаружено ${analysis.faults.length} параметр(а), выходящих за пределы допустимых отклонений.</p>
                
                <h4>Необходимые действия:</h4>
                <ol>
                    <li>Обеспечить дополнительный контроль отклоняющихся параметров</li>
                    <li>Запланировать внеочередное техническое обслуживание</li>
                    <li>При ухудшении параметров немедленно остановить оборудование</li>
                    <li>Вызвать специалистов для детальной диагностики</li>
                </ol>
            `;
            
            // Показываем детальный анализ
            detailedAnalysis.style.display = 'block';
            
            // Заполняем детальный анализ
            let analysisDetailsHTML = '';
            analysis.faults.forEach(fault => {
                const faultInfo = faultDatabase[fault.type];
                if (faultInfo) {
                    analysisDetailsHTML += `
                        <div class="analysis-item error">
                            <h4>${faultInfo.title}</h4>
                            <p><strong>Отклонение:</strong> ${fault.deviation > 0 ? '+' : ''}${fault.deviation.toFixed(1)}% (измерено: ${fault.measured} ${parameterUnits[fault.param]}, номинал: ${fault.reference} ${parameterUnits[fault.param]})</p>
                            <p><strong>Возможные причины:</strong> ${faultInfo.causes.join('; ')}</p>
                            <p><strong>Рекомендации:</strong> ${faultInfo.recommendations.join('; ')}</p>
                        </div>
                    `;
                }
            });
            analysisDetails.innerHTML = analysisDetailsHTML;
        }
        
        recommendationsContent.innerHTML = recommendationsHTML;
        
        // Обновляем статус
        updateStatus(analysis.overallStatus);
    }

    // Обновление статуса
    function updateStatus(status) {
        // Обновляем бейдж в заголовке
        statusBadge.className = `status-badge status-${status}`;
        statusBadge.textContent = status === 'good' ? 'В норме' : 'Требует внимания';
        
        // Обновляем индикатор в правой колонке
        statusIndicator.className = `status-indicator status-${status}`;
        statusText.textContent = status === 'good' ? 'Все параметры в норме' : 'Обнаружены отклонения';
        statusText.style.color = status === 'good' ? '#51cf66' : '#ff922b';
    }

    // Сброс анализа
    function resetAnalysis() {
        resultsPlaceholder.style.display = 'flex';
        resultsContent.style.display = 'none';
        detailedAnalysis.style.display = 'none';
        
        // Сбрасываем статус
        statusBadge.className = 'status-badge status-idle';
        statusBadge.textContent = 'Ожидает анализа';
        
        statusIndicator.className = 'status-indicator status-idle';
        statusText.textContent = 'Ожидание данных';
        statusText.style.color = '#666';
    }

    // Генерация отчета
    function generateReport() {
        const motorModel = document.querySelector('.section-header h2').textContent;
        const analysisDate = new Date().toLocaleString('ru-RU');
        
        // Здесь будет логика генерации PDF или сохранения данных
        alert(`Отчет сгенерирован!\n\n` +
              `Модель двигателя: ${motorModel}\n` +
              `Дата анализа: ${analysisDate}\n\n` +
              'Отчет готов к сохранению или печати.');
    }

    // Инициализация
    function init() {
        console.log('Система анализа двигателя инициализирована');
    }

    init();
});