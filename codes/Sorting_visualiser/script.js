let array = [];
let originalArray = [];
let currentAlgorithm = 'selection';
let steps = [];
let currentStep = 0;
let isAutoPlaying = false;
let autoInterval = null;
let speed = 50; 
let currentTheme = 'light';

const pseudocodes = {
    selection: [
        'procedure selectionSort(array)',
        '    n = length(array)',
        '    for i = 0 to n-1',
        '        minIndex = i',
        '        for j = i+1 to n',
        '            if array[j] < array[minIndex]',
        '                minIndex = j',
        '        swap array[i] with array[minIndex]',
        '        mark array[i] as sorted',
        '    end for',
        'end procedure'
    ],
    heap: [
        'procedure heapSort(array)',
        '    n = length(array)',
        '    // Build max heap',
        '    for i = n/2 - 1 down to 0',
        '        heapify(array, n, i)',
        '    // Extract elements from heap',
        '    for i = n-1 down to 1',
        '        swap array[0] with array[i]',
        '        mark array[i] as sorted',
        '        heapify(array, i, 0)',
        'end procedure',
        '',
        'procedure heapify(array, n, i)',
        '    largest = i',
        '    left = 2*i + 1',
        '    right = 2*i + 2',
        '    if left < n and array[left] > array[largest]',
        '        largest = left',
        '    if right < n and array[right] > array[largest]',
        '        largest = right',
        '    if largest != i',
        '        swap array[i] with array[largest]',
        '        heapify(array, n, largest)',
        'end procedure'
    ]
};

function computeInterval() {
    const ms = 1050 - (Number(speed) * 10);
    return Math.max(50, ms || 500); 
}

function startOrRefreshAutoTimer() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
    autoInterval = setInterval(() => {
        stepSort();
        if (currentStep >= steps.length) {
            stopAuto(); 
        }
    }, computeInterval());
}

$(document).ready(function () {
    generateRandomArray();
    updatePseudocode();

    const initial = parseInt($('#speedSlider').val(), 10);
    speed = isNaN(initial) ? 50 : initial;
    $('#speedValue').text(speed);

    $('#algorithmSelect').on('change', handleAlgorithmChange);
    $('#setArrayBtn').on('click', setCustomArray);
    $('#randomBtn').on('click', generateRandomArray);
    $('#sortBtn').on('click', stepSort);
    $('#autoBtn').on('click', autoPlay);
    $('#stopBtn').on('click', () => stopAuto());
    $('#resetBtn').on('click', reset);

    $('#speedSlider').on('input', function () {
        updateSpeed();
        if (isAutoPlaying) {
            startOrRefreshAutoTimer(); 
        }
    });

    $('#themeToggle').on('click', toggleTheme);
    $('#aboutBtn').on('click', openAboutModal);
    $('#modalClose').on('click', closeAboutModal);
    $('#aboutModal').on('click', function (e) {
        if ($(e.target).is('#aboutModal')) {
            closeAboutModal();
        }
    });
});

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    $('html').attr('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        $('#themeToggle').text('☀️ Light Mode');
    } else {
        $('#themeToggle').text('🌙 Dark Mode');
    }
}

function openAboutModal() {
    $('#aboutModal').addClass('active');
}

function closeAboutModal() {
    $('#aboutModal').removeClass('active');
}

function generateRandomArray() {
    const size = 15;
    array = [];
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 100) + 1);
    }
    originalArray = [...array];
    $('#warningBanner').css('display', 'none');
    reset();
}

function setCustomArray() {
    const input = $('#arrayInput').val();
    const numbers = input.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));

    if (numbers.length > 0) {
        const maxNum = Math.max(...numbers);
        const hasLargeNumbers = maxNum > 100;

        array = numbers;
        originalArray = [...array];

        if (hasLargeNumbers) {
            $('#warningBanner')
                .text(`⚠️ Warning: Array contains large values (max: ${maxNum}). For better visualization, consider using numbers ≤ 100.`)
                .css('display', 'block');
        } else {
            $('#warningBanner').css('display', 'none');
        }

        reset();
    }
}

function handleAlgorithmChange() {
    currentAlgorithm = $('#algorithmSelect').val();
    updatePseudocode();
    reset();
}

function updatePseudocode() {
    const title = currentAlgorithm === 'selection' ? 'Selection Sort Pseudocode' : 'Heap Sort Pseudocode';
    $('#pseudocodeTitle').text(title);

    const lines = pseudocodes[currentAlgorithm];
    const html = lines.map((line, i) =>
        `<div class="pseudocode-line" data-line="${i}">${line}</div>`
    ).join('');
    $('#pseudocodeContent').html(html);
}

function highlightPseudocodeLine(lineNumber) {
    $('.pseudocode-line').removeClass('active');
    if (lineNumber >= 0) {
        const $line = $(`.pseudocode-line[data-line="${lineNumber}"]`);
        if ($line.length) {
            $line.addClass('active');
            $line[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

function updateSpeed() {
    speed = parseInt($('#speedSlider').val(), 10);
    if (isNaN(speed)) speed = 50;
    $('#speedValue').text(speed);
}

function reset() {
    stopAuto(); 
    array = [...originalArray];
    steps = [];
    currentStep = 0;

    if (currentAlgorithm === 'selection') {
        generateSelectionSortSteps();
    } else {
        generateHeapSortSteps();
    }

    updateDisplay();
    $('#sortBtn').prop('disabled', false);
    highlightPseudocodeLine(-1);
}

function autoPlay() {
    if (isAutoPlaying) return;
    isAutoPlaying = true;

    $('#autoBtn').prop('disabled', true);
    $('#stopBtn').prop('disabled', false);
    $('#sortBtn').prop('disabled', true);

    startOrRefreshAutoTimer();
}


function stopAuto() {
    isAutoPlaying = false;
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
    $('#autoBtn').prop('disabled', false);
    $('#stopBtn').prop('disabled', true);
    if (currentStep < steps.length) {
        $('#sortBtn').prop('disabled', false);
    } else {
        $('#sortBtn').prop('disabled', true);
    }
}

function stepSort() {
    if (currentStep >= steps.length) {
        return;
    }

    const step = steps[currentStep];
    array = [...step.array];

    highlightPseudocodeLine(step.line);
    updateDisplay(step);

    currentStep++;

    if (currentStep >= steps.length) {
        $('#sortBtn').prop('disabled', true);
    }
}

function updateDisplay(step) {
    $('#currentArray').text(array.join(', '));
    renderBars(step);

    if (currentAlgorithm === 'heap') {
        $('#treeContainer').css('display', 'block');
        renderTree(step);
    } else {
        $('#treeContainer').css('display', 'none');
    }
}

function generateSelectionSortSteps() {
    const arr = [...originalArray];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        steps.push({ type: 'compare', indices: [i], line: 3, array: [...arr] });

        for (let j = i + 1; j < n; j++) {
            steps.push({ type: 'compare', indices: [minIndex, j], line: 5, array: [...arr] });

            if (arr[j] < arr[minIndex]) {
                minIndex = j;
                steps.push({ type: 'compare', indices: [minIndex], line: 6, array: [...arr] });
            }
        }

        if (minIndex !== i) {
            steps.push({ type: 'swap', indices: [i, minIndex], line: 7, array: [...arr] });
            [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
            steps.push({ type: 'swapped', indices: [i, minIndex], line: 7, array: [...arr] });
        }

        steps.push({ type: 'sorted', indices: [i], line: 8, array: [...arr] });
    }

    steps.push({ type: 'sorted', indices: [n - 1], line: 9, array: [...arr] });
    steps.push({ type: 'done', indices: [], line: 10, array: [...arr] });
}

function generateHeapSortSteps() {
    const arr = [...originalArray];
    const n = arr.length;

    steps.push({ type: 'info', indices: [], line: 2, array: [...arr] });
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapifySteps(arr, n, i, false);
    }

    // Extract elements
    steps.push({ type: 'info', indices: [], line: 5, array: [...arr] });
    for (let i = n - 1; i > 0; i--) {
        steps.push({ type: 'swap', indices: [0, i], line: 7, array: [...arr] });
        [arr[0], arr[i]] = [arr[i], arr[0]];
        steps.push({ type: 'swapped', indices: [0, i], line: 7, array: [...arr] });
        steps.push({ type: 'sorted', indices: [i], line: 8, array: [...arr] });
        heapifySteps(arr, i, 0, true);
    }

    steps.push({ type: 'sorted', indices: [0], line: 9, array: [...arr] });
    steps.push({ type: 'done', indices: [], line: 10, array: [...arr] });
}

function heapifySteps(arr, n, i, duringExtract) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    steps.push({ type: 'compare', indices: [i], line: 12, array: [...arr] });

    if (left < n) {
        steps.push({ type: 'compare', indices: [largest, left], line: 15, array: [...arr] });
        if (arr[left] > arr[largest]) {
            largest = left;
        }
    }

    if (right < n) {
        steps.push({ type: 'compare', indices: [largest, right], line: 17, array: [...arr] });
        if (arr[right] > arr[largest]) {
            largest = right;
        }
    }

    if (largest !== i) {
        steps.push({ type: 'swap', indices: [i, largest], line: 20, array: [...arr] });
        [arr[i], arr[largest]] = [arr[largest], arr[i]];
        steps.push({ type: 'swapped', indices: [i, largest], line: 20, array: [...arr] });
        heapifySteps(arr, n, largest, duringExtract);
    }
}

function renderBars(step) {
    const $container = $('#barsContainer');
    $container.empty();

    const maxVal = Math.max(...array);
    const containerHeight = $container.height() || 300;
    const availableHeight = containerHeight - 40;
    const scaleFactor = maxVal > 0 ? (availableHeight / maxVal) : 1;

    $.each(array, function (idx, val) {
        const barHeight = val * scaleFactor;

        const $bar = $('<div></div>')
            .addClass('bar')
            .css('height', barHeight + 'px')
            .text(val);

        if (step) {
            if (step.type === 'compare' && step.indices.includes(idx)) {
                $bar.addClass('comparing');
            } else if (step.type === 'swap' && step.indices.includes(idx)) {
                $bar.addClass('swapping');
            } else if (step.type === 'swapped' && step.indices.includes(idx)) {
                $bar.addClass('swapping');
            }

            if (currentAlgorithm === 'selection') {
                const sortedCount = steps.slice(0, currentStep)
                    .filter(s => s.type === 'sorted')
                    .reduce((acc, s) => {
                        s.indices.forEach(i => acc.add(i));
                        return acc;
                    }, new Set()).size;
                if (idx < sortedCount || step.type === 'done') {
                    $bar.removeClass('comparing swapping').addClass('sorted');
                }
            } else {
                const sortedIndices = steps.slice(0, currentStep)
                    .filter(s => s.type === 'sorted')
                    .reduce((acc, s) => {
                        s.indices.forEach(i => acc.add(i));
                        return acc;
                    }, new Set());
                if (sortedIndices.has(idx) || step.type === 'done') {
                    $bar.removeClass('comparing swapping').addClass('sorted');
                }
            }
        }

        $container.append($bar);
    });
}

function renderTree(step) {
    const $container = $('#treeContainer');
    $container.empty();

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    $(svg).addClass('tree-lines');
    $container.append(svg);

    const containerWidth = $container.width();
    const levelHeight = 70;
    const nodeRadius = 20;

    const positions = [];

    function calculatePosition(index, level, positionInLevel, maxInLevel) {
        const x = (containerWidth / (maxInLevel + 1)) * (positionInLevel + 1);
        const y = level * levelHeight + 30;
        return { x, y };
    }

    for (let i = 0; i < array.length; i++) {
        const level = Math.floor(Math.log2(i + 1));
        const firstInLevel = Math.pow(2, level) - 1;
        const positionInLevel = i - firstInLevel;
        const maxInLevel = Math.pow(2, level);
        positions[i] = calculatePosition(i, level, positionInLevel, maxInLevel);
    }

    for (let i = 0; i < array.length; i++) {
        const leftChild = 2 * i + 1;
        const rightChild = 2 * i + 2;

        if (leftChild < array.length) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            $(line).attr({
                'x1': positions[i].x,
                'y1': positions[i].y,
                'x2': positions[leftChild].x,
                'y2': positions[leftChild].y,
                'stroke': getComputedStyle(document.documentElement).getPropertyValue('--tree-line'),
                'stroke-width': '2'
            });
            $(svg).append(line);
        }

        if (rightChild < array.length) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            $(line).attr({
                'x1': positions[i].x,
                'y1': positions[i].y,
                'x2': positions[rightChild].x,
                'y2': positions[rightChild].y,
                'stroke': getComputedStyle(document.documentElement).getPropertyValue('--tree-line'),
                'stroke-width': '2'
            });
            $(svg).append(line);
        }
    }

    $.each(array, function (idx, val) {
        const $node = $('<div></div>')
            .addClass('tree-node')
            .text(val)
            .css({
                'left': (positions[idx].x - nodeRadius) + 'px',
                'top': (positions[idx].y - nodeRadius) + 'px'
            });

        if (step) {
            if (step.type === 'compare' && step.indices.includes(idx)) {
                $node.addClass('comparing');
            } else if (step.type === 'swap' && step.indices.includes(idx)) {
                $node.addClass('swapping');
            } else if (step.type === 'swapped' && step.indices.includes(idx)) {
                $node.addClass('swapping');
            }

            const sortedIndices = steps.slice(0, currentStep)
                .filter(s => s.type === 'sorted')
                .reduce((acc, s) => {
                    s.indices.forEach(i => acc.add(i));
                    return acc;
                }, new Set());
            if (sortedIndices.has(idx) || step.type === 'done') {
                $node.removeClass('comparing swapping').addClass('sorted');
            }
        }

        $container.append($node);
    });
}
