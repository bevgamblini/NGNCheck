document.addEventListener('DOMContentLoaded', function() {
    console.log('Скрипт engine.js загружен');
    
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

    console.log('Элементы DOM найдены:', {
        analysisForm: !!analysisForm,
        resultsPlaceholder: !!resultsPlaceholder,
        resultsContent: !!resultsContent
    });

    // Функция для получения номинальных значений из HTML (упрощенная)
    function getNominalValuesFromHTML() {
        console.log('Получение номинальных значений из HTML...');
        
        const referenceValues = {};
        const nominalElements = document.querySelectorAll('.nominal-data');
        
        nominalElements.forEach(element => {
            const param = element.getAttribute('data-param');
            const rawValue = element.getAttribute('data-value');
            
            if (param && rawValue) {
                // Так как в data-value только цифры, можно сразу парсить
                const value = parseFloat(rawValue.trim());
                if (!isNaN(value)) {
                    referenceValues[param] = value;
                    console.log(`Номинальное значение для ${param}: ${referenceValues[param]}`);
                } else {
                    console.warn(`Не удалось распарсить значение для ${param}: "${rawValue}"`);
                }
            }
        });
        
        // Проверяем, что все значения получены
        const requiredParams = ['current', 'vibration', 'temperature', 'isolation'];
        const missingParams = requiredParams.filter(param => !referenceValues[param]);
        
        if (missingParams.length > 0) {
            console.warn('Не все номинальные значения найдены, используются значения по умолчанию');
            
            // Значения по умолчанию
            const defaultValues = {
                current: 4.85,
                vibration: 2.8,
                temperature: 70,
                isolation: 1.22
            };
            
            // Используем значения по умолчанию для отсутствующих параметров
            missingParams.forEach(param => {
                referenceValues[param] = defaultValues[param];
                console.log(`Используется значение по умолчанию для ${param}: ${referenceValues[param]}`);
            });
        }
        
        return referenceValues;
    }
    
    // Инициализация эталонных значений
    let referenceValues = getNominalValuesFromHTML();
    
    console.log('Используемые номинальные значения:', referenceValues);

    // Допустимые отклонения (%) - без напряжения
    const tolerances = {
        current: 10,      // ±10%
        vibration: 20,    // ±20%
        temperature: 15,  // ±15%
        isolation: -30    // минимальный порог (-30% от номинала)
    };

    // Описания параметров (без напряжения)
    const parameterNames = {
        current: 'Ток статора',
        vibration: 'Вибрация',
        temperature: 'Температура подшипника',
        isolation: 'Сопротивление изоляции'
    };

    // Единицы измерения (без напряжения)
    const parameterUnits = {
        current: 'А',
        vibration: 'мм/с',
        temperature: '°C',
        isolation: 'МОм'
    };

    // База знаний по неисправностям (убраны voltage_high и voltage_low)
    const faultDatabase = {
        current_high: {
            title: "Повышенный ток статора",
            description: "Значение тока превышает номинальное",
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
            description: "Значение тока ниже номинального",
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
        vibration_high: {
            title: "Повышенная вибрация",
            description: "Вибрация превышает допустимую",
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
            description: "Температура превышает допустимую",
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
            description: "Сопротивление изоляции ниже нормы",
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
    if (analysisForm) {
        analysisForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Форма отправлена');
            
            try {
                // Собираем данные из формы (без напряжения)
                const measuredValues = {
                    current: parseFloat(document.getElementById('current').value) || 0,
                    vibration: parseFloat(document.getElementById('vibration').value) || 0,
                    temperature: parseFloat(document.getElementById('temperature').value) || 0,
                    isolation: parseFloat(document.getElementById('isolation').value) || 0
                };

                console.log('Введенные значения:', measuredValues);
                console.log('Номинальные значения для сравнения:', referenceValues);

                // Проверка на нулевые значения
                let hasEmptyFields = false;
                Object.keys(measuredValues).forEach(key => {
                    if (measuredValues[key] === 0 || isNaN(measuredValues[key])) {
                        console.error(`Поле ${key} не заполнено или содержит 0`);
                        hasEmptyFields = true;
                    }
                });

                if (hasEmptyFields) {
                    alert('Пожалуйста, заполните все поля корректными числовыми значениями!');
                    return;
                }

                // Выполняем анализ
                const analysisResults = analyzeParameters(measuredValues);
                console.log('Результаты анализа:', analysisResults);
                
                // Отображаем результаты
                displayResults(analysisResults);
                
                // Прокручиваем к результатам
                resultsContent.scrollIntoView({ behavior: 'smooth' });
                
            } catch (error) {
                console.error('Ошибка при анализе:', error);
                alert('Произошла ошибка при анализе данных. Проверьте правильность введенных значений.');
            }
        });
    } else {
        console.error('Элемент analysisForm не найден!');
    }

    // Сброс формы
    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', function() {
            console.log('Сброс формы');
            if (analysisForm) analysisForm.reset();
            resetAnalysis();
        });
    }

    // Сохранение отчета
    if (saveReportBtn) {
        saveReportBtn.addEventListener('click', function() {
            generateReport();
        });
    }

    // Печать отчета
    if (printReportBtn) {
        printReportBtn.addEventListener('click', function() {
            window.print();
        });
    }

    // Функция анализа параметров (без напряжения)
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
                const absDeviation = Math.abs(deviation);
                const absTolerance = Math.abs(tolerance);
                
                if (absDeviation > absTolerance) {
                    deviationType = 'error';
                    if (param === 'current' && deviation > 0) faultType = 'current_high';
                    if (param === 'current' && deviation < 0) faultType = 'current_low';
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

    // Отображение результатов (без изменений в логике, только убраны ссылки на напряжение)
    function displayResults(analysis) {
        console.log('Отображение результатов:', analysis);
        
        // Скрываем заглушку и показываем контент
        if (resultsPlaceholder) resultsPlaceholder.style.display = 'none';
        if (resultsContent) resultsContent.style.display = 'flex';
        
        // Заполняем таблицу сравнения
        if (comparisonTable) {
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
        }
        
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
            if (detailedAnalysis) detailedAnalysis.style.display = 'none';
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
            if (detailedAnalysis) {
                detailedAnalysis.style.display = 'block';
                
                // Заполняем детальный анализ
                let analysisDetailsHTML = '';
                analysis.faults.forEach(fault => {
                    const faultInfo = faultDatabase[fault.type];
                    if (faultInfo) {
                        analysisDetailsHTML += `
                            <div class="analysis-item error">
                                <h4>${faultInfo.title}</h4>
                                <p><strong>Параметр:</strong> ${parameterNames[fault.param]}</p>
                                <p><strong>Отклонение:</strong> ${fault.deviation > 0 ? '+' : ''}${fault.deviation.toFixed(1)}% (измерено: ${fault.measured} ${parameterUnits[fault.param]}, номинал: ${fault.reference} ${parameterUnits[fault.param]})</p>
                                <p><strong>Возможные причины:</strong> ${faultInfo.causes.join('; ')}</p>
                                <p><strong>Рекомендации:</strong> ${faultInfo.recommendations.join('; ')}</p>
                            </div>
                        `;
                    }
                });
                analysisDetails.innerHTML = analysisDetailsHTML;
            }
        }
        
        if (recommendationsContent) {
            recommendationsContent.innerHTML = recommendationsHTML;
        }
        
        // Обновляем статус
        updateStatus(analysis.overallStatus);
    }

    // Обновление статуса (без изменений)
    function updateStatus(status) {
        console.log('Обновление статуса:', status);
        
        // Обновляем бейдж в заголовке
        if (statusBadge) {
            statusBadge.className = `status-badge status-${status}`;
            statusBadge.textContent = status === 'good' ? 'В норме' : 'Требует внимания';
        }
        
        // Обновляем индикатор в правой колонке
        if (statusIndicator) {
            statusIndicator.className = `status-indicator status-${status}`;
        }
        if (statusText) {
            statusText.textContent = status === 'good' ? 'Все параметры в норме' : 'Обнаружены отклонения';
            statusText.style.color = status === 'good' ? '#51cf66' : '#ff922b';
        }
    }

    // Сброс анализа (без изменений)
    function resetAnalysis() {
        console.log('Сброс анализа');
        
        if (resultsPlaceholder) resultsPlaceholder.style.display = 'flex';
        if (resultsContent) resultsContent.style.display = 'none';
        if (detailedAnalysis) detailedAnalysis.style.display = 'none';
        
        // Сбрасываем статус
        if (statusBadge) {
            statusBadge.className = 'status-badge status-idle';
            statusBadge.textContent = 'Ожидает анализа';
        }
        
        if (statusIndicator) {
            statusIndicator.className = 'status-indicator status-idle';
        }
        if (statusText) {
            statusText.textContent = 'Ожидание данных';
            statusText.style.color = '#666';
        }
        
        // Очищаем таблицу сравнения
        if (comparisonTable) comparisonTable.innerHTML = '';
        if (recommendationsContent) recommendationsContent.innerHTML = '';
        if (analysisDetails) analysisDetails.innerHTML = '';
    }

    // Генерация отчета (без изменений)
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
        console.log('Номинальные значения (считаны из HTML):', referenceValues);
        
        // Показываем детали полученных значений
        console.log('Детали номинальных значений:');
        Object.keys(referenceValues).forEach(key => {
            if (parameterUnits[key]) {
                console.log(`  ${key}: ${referenceValues[key]} ${parameterUnits[key]}`);
            }
        });
        
        // Проверяем доступность всех элементов
        const elements = {
            'Форма': analysisForm,
            'Плейсхолдер': resultsPlaceholder,
            'Контент результатов': resultsContent,
            'Таблица сравнения': comparisonTable
        };
        
        for (const [name, element] of Object.entries(elements)) {
            if (!element) {
                console.error(`Элемент "${name}" не найден!`);
            }
        }
    }

    init();
});